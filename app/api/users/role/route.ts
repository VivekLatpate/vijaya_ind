import { auth } from "@clerk/nextjs/server";

import { errorResponse, successResponse } from "@/lib/api";
import { requireAdminUser, updateUserRole } from "@/lib/users";
import { validateRolePayload } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const admin = await requireAdminUser();
  if (!admin) {
    return errorResponse("Forbidden.", 403);
  }

  const body = await request.json().catch(() => null);
  const validated = validateRolePayload(body);

  if (!validated.ok) {
    return errorResponse(validated.error, 422);
  }

  try {
    const user = await updateUserRole(validated.data.userId, validated.data.role);

    if (!user) {
      return errorResponse("User not found.", 404);
    }

    return successResponse({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update the user role.";

    return errorResponse(message, 409);
  }
}
