import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeBoolean,
  sanitizeText,
} from "@/lib/admin";
import { deleteUserByDatabaseId, updateBuyerById } from "@/lib/users";
import { isUserRole } from "@/lib/validators";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid buyer id.", 422);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const roleValue = sanitizeText(value.role);
  const role = isUserRole(roleValue) ? roleValue : undefined;

  try {
    const user = await updateBuyerById(id, {
      name: value.name !== undefined ? sanitizeText(value.name) : undefined,
      email: value.email !== undefined ? sanitizeText(value.email) : undefined,
      phone: value.phone !== undefined ? sanitizeText(value.phone) : undefined,
      companyName:
        value.companyName !== undefined ? sanitizeText(value.companyName) : undefined,
      address: value.address !== undefined ? sanitizeText(value.address) : undefined,
      gstin: value.gstin !== undefined ? sanitizeText(value.gstin) : undefined,
      isActive:
        typeof value.isActive === "boolean"
          ? sanitizeBoolean(value.isActive)
          : undefined,
      role,
    });

    if (!user) {
      return errorResponse("Buyer not found.", 404);
    }

    return successResponse({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update buyer.";

    return errorResponse(message, 409);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid buyer id.", 422);
  }

  try {
    const result = await deleteUserByDatabaseId(id);

    if (!result) {
      return errorResponse("Buyer not found.", 404);
    }

    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to deactivate buyer.";

    return errorResponse(message, 409);
  }
}
