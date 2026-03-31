import { auth } from "@clerk/nextjs/server";

import { errorResponse, successResponse } from "@/lib/api";
import { syncCurrentUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const user = await syncCurrentUser();
  if (!user) {
    return errorResponse("Unable to sync the current user.", 500);
  }

  return successResponse({ user });
}
