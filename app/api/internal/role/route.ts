import { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-internal-secret");
  const internalSecret = process.env.CLERK_SECRET_KEY;

  if (!secret || !internalSecret || secret !== internalSecret) {
    return errorResponse("Forbidden.", 403);
  }

  const clerkId = request.nextUrl.searchParams.get("clerkId");
  if (!clerkId) {
    return errorResponse("clerkId is required.", 422);
  }

  await connectToDatabase();
  const user = await UserModel.findOne({ clerkId }).lean();

  return successResponse({
    role: user?.role ?? "USER",
  });
}
