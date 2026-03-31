import { auth } from "@clerk/nextjs/server";

import { errorResponse, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { USER_ROLES } from "@/lib/constants";
import { UserModel } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  await connectToDatabase();

  const currentUser = await UserModel.findOne({ clerkId: userId }).lean();
  if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
    return errorResponse("Forbidden.", 403);
  }

  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  return successResponse({ users });
}
