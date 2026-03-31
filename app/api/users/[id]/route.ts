import { auth } from "@clerk/nextjs/server";

import { errorResponse, successResponse } from "@/lib/api";
import { deleteUserByDatabaseId, requireAdminUser } from "@/lib/users";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const admin = await requireAdminUser();
  if (!admin) {
    return errorResponse("Forbidden.", 403);
  }

  const { id } = await context.params;

  try {
    const result = await deleteUserByDatabaseId(id);

    if (!result) {
      return errorResponse("User not found.", 404);
    }

    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete the user.";

    return errorResponse(message, 409);
  }
}
