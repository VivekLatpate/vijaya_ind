import { auth } from "@clerk/nextjs/server";

import { errorResponse, successResponse } from "@/lib/api";
import { syncCurrentUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const user = await syncCurrentUser();
    if (!user) {
      console.error("[users/sync] syncCurrentUser returned null", { userId });
      return errorResponse("Unable to sync the current user.", 500);
    }

    console.log("[users/sync] user synced", {
      userId,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
    });

    return successResponse({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected sync error.";

    console.error("[users/sync] sync failed", {
      userId,
      message,
      error,
    });

    return errorResponse(message, 500);
  }
}
