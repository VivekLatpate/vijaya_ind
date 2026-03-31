import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

import { USER_ROLES, type UserRole } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

type SyncUserParams = {
  clerkId: string;
  email: string;
  name: string;
  phone?: string;
};

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function resolveInitialRole(email: string, existingRole?: UserRole) {
  if (existingRole === USER_ROLES.ADMIN) {
    return USER_ROLES.ADMIN;
  }

  // Optional env-based bootstrap so the first trusted email can become ADMIN.
  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(email.toLowerCase())) {
    return USER_ROLES.USER;
  }

  const existingAdmin = await UserModel.findOne({ role: USER_ROLES.ADMIN }).lean();
  if (!existingAdmin || existingAdmin.email === email.toLowerCase()) {
    return USER_ROLES.ADMIN;
  }

  return USER_ROLES.USER;
}

export async function syncUserToDatabase({
  clerkId,
  email,
  name,
  phone,
}: SyncUserParams) {
  await connectToDatabase();

  const existingUser = await UserModel.findOne({ clerkId });
  const role = await resolveInitialRole(email, existingUser?.role);

  const user = await UserModel.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      email: email.toLowerCase(),
      name,
      phone: phone ?? "",
      role,
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  // Clerk metadata keeps the role available to the frontend and session layer.
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role: user.role,
    },
  });

  return user;
}

export async function syncCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const primaryEmail =
    user.emailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
    )?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  const primaryPhone =
    user.phoneNumbers.find(
      (phoneNumber) => phoneNumber.id === user.primaryPhoneNumberId,
    )?.phoneNumber ?? user.phoneNumbers[0]?.phoneNumber ?? "";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return syncUserToDatabase({
    clerkId: user.id,
    email: primaryEmail,
    name: fullName || user.username || "New User",
    phone: primaryPhone,
  });
}

export async function getCurrentDatabaseUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  await connectToDatabase();
  return UserModel.findOne({ clerkId: userId }).lean();
}

export async function requireAdminUser() {
  const user = await getCurrentDatabaseUser();

  if (!user || user.role !== USER_ROLES.ADMIN) {
    return null;
  }

  return user;
}

export async function updateUserRole(clerkId: string, role: UserRole) {
  await connectToDatabase();

  const user = await UserModel.findOne({ clerkId });
  if (!user) {
    return null;
  }

  if (role === USER_ROLES.ADMIN) {
    const existingAdmin = await UserModel.findOne({ role: USER_ROLES.ADMIN });
    if (existingAdmin && existingAdmin.clerkId !== clerkId) {
      throw new Error("Only one ADMIN user is allowed.");
    }
  }

  if (user.role === USER_ROLES.ADMIN && role === USER_ROLES.USER) {
    const anotherAdmin = await UserModel.findOne({
      role: USER_ROLES.ADMIN,
      clerkId: { $ne: clerkId },
    });

    if (!anotherAdmin) {
      throw new Error("Assign another ADMIN before demoting the current admin.");
    }
  }

  user.role = role;
  await user.save();

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role,
    },
  });

  return user.toObject();
}

export async function deleteUserByDatabaseId(databaseId: string) {
  await connectToDatabase();

  const user = await UserModel.findById(databaseId);
  if (!user) {
    return null;
  }

  if (user.role === USER_ROLES.ADMIN) {
    throw new Error("The ADMIN account cannot be deleted from the admin panel.");
  }

  const clerkId = user.clerkId;
  await user.deleteOne();

  const client = await clerkClient();
  await client.users.deleteUser(clerkId);

  return { deletedId: databaseId };
}
