import { auth, clerkClient } from "@clerk/nextjs/server";

import { USER_ROLES, type UserRole } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { computeBuyerProfileMetrics } from "@/lib/business";

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

  console.log("[users] syncUserToDatabase:start", {
    clerkId,
    email,
    name,
  });

  const existingUser = await UserModel.findOne({ clerkId });
  const role = await resolveInitialRole(email, existingUser?.role);

  let user;

  try {
    user = await UserModel.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        email: email.toLowerCase(),
        name,
        phone: phone ?? "",
        role,
        isActive: true,
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).lean();
  } catch (error) {
    console.error("[users] syncUserToDatabase:db-error", {
      clerkId,
      email,
      error,
    });
    throw error;
  }

  console.log("[users] syncUserToDatabase:success", {
    clerkId,
    role: user?.role,
    mongoId: user?._id,
  });

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
    console.log("[users] syncCurrentUser:no-auth-user");
    return null;
  }

  const client = await clerkClient();

  let user: Awaited<ReturnType<typeof client.users.getUser>> | null = null;

  try {
    user = await client.users.getUser(userId);
  } catch (error) {
    console.error("[users] failed to fetch Clerk user", {
      userId,
      error,
    });
    return null;
  }

  console.log("[users] syncCurrentUser:clerk-user", {
    userId,
    emailCount: user.emailAddresses.length,
    primaryEmailAddressId: user.primaryEmailAddressId,
    username: user.username,
  });

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

  console.log("[users] syncCurrentUser:normalized", {
    userId,
    primaryEmail,
    fullName: fullName || user.username || "New User",
    primaryPhone,
  });

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

  const user = await UserModel.findOne({ clerkId: userId });
  if (!user) {
    console.log("[users] no Mongo user found, syncing from Clerk", { userId });
    return syncCurrentUser();
  }

  if (user.isActive === undefined) {
    user.isActive = true;
    await user.save();
  }

  return user.toObject();
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

  user.isActive = false;
  await user.save();

  if (user.clerkId) {
    const client = await clerkClient();
    await client.users.updateUser(user.clerkId, {
      privateMetadata: {
        deactivatedByAdmin: true,
      },
    });
  }

  return { deletedId: databaseId };
}

export async function createManualBuyer(params: {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  gstin?: string;
}) {
  await connectToDatabase();

  const existing = await UserModel.findOne({ email: params.email.toLowerCase() }).lean();
  if (existing) {
    throw new Error("A buyer with this email already exists.");
  }

  const user = await UserModel.create({
    name: params.name,
    email: params.email.toLowerCase(),
    phone: params.phone ?? "",
    companyName: params.companyName ?? "",
    address: params.address ?? "",
    gstin: params.gstin ?? "",
    role: USER_ROLES.USER,
    isActive: true,
  });

  return user.toObject();
}

export async function updateBuyerById(
  databaseId: string,
  params: {
    name?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    gstin?: string;
    isActive?: boolean;
    role?: UserRole;
  },
) {
  await connectToDatabase();

  const user = await UserModel.findById(databaseId);
  if (!user) {
    return null;
  }

  if (params.name !== undefined) user.name = params.name;
  if (params.email !== undefined) user.email = params.email.toLowerCase();
  if (params.phone !== undefined) user.phone = params.phone;
  if (params.companyName !== undefined) user.companyName = params.companyName;
  if (params.address !== undefined) user.address = params.address;
  if (params.gstin !== undefined) user.gstin = params.gstin;
  if (params.isActive !== undefined) user.isActive = params.isActive;

  if (params.role !== undefined) {
    if (params.role === USER_ROLES.ADMIN) {
      const existingAdmin = await UserModel.findOne({ role: USER_ROLES.ADMIN });
      if (existingAdmin && String(existingAdmin._id) !== databaseId) {
        throw new Error("Only one ADMIN user is allowed.");
      }
    }

    user.role = params.role;
  }

  await user.save();

  if (user.clerkId) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: user.role,
      },
    });
  }

  return user.toObject();
}

export async function listBuyersWithMetrics() {
  await connectToDatabase();
  const users = await UserModel.find({ role: USER_ROLES.USER }).sort({ createdAt: -1 }).lean();

  const buyers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      metrics: await computeBuyerProfileMetrics(String(user._id)),
    })),
  );

  return buyers;
}
