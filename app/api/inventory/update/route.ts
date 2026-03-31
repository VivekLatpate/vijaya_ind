import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/admin";
import { adjustInventoryStock } from "@/lib/business";
import { INVENTORY_CHANGE_TYPES } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const productId = sanitizeText(value.productId);
  const quantity = sanitizeNumber(value.quantity);
  const reason = sanitizeText(value.reason);
  const changeType = sanitizeText(value.changeType);

  if (!isValidObjectId(productId) || quantity <= 0 || !reason) {
    return errorResponse("productId, quantity, and reason are required.", 422);
  }

  if (![INVENTORY_CHANGE_TYPES.IN, INVENTORY_CHANGE_TYPES.OUT].includes(changeType as "IN")) {
    return errorResponse("changeType must be IN or OUT.", 422);
  }

  try {
    const product = await adjustInventoryStock({
      productId,
      quantity,
      reason,
      changeType: changeType as "IN" | "OUT",
    });

    return successResponse({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update inventory.";
    return errorResponse(message, 409);
  }
}
