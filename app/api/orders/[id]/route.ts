import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, isValidObjectId, sanitizeText } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { updateOrderState } from "@/lib/business";
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/lib/constants";
import { OrderModel } from "@/models/Order";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid order id.", 422);
  }

  await connectToDatabase();
  const order = await OrderModel.findById(id)
    .populate("buyerId", "name email companyName phone address gstin")
    .lean();

  if (!order) {
    return errorResponse("Order not found.", 404);
  }

  return successResponse({ order });
}

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid order id.", 422);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const status = sanitizeText(value.status);
  const paymentStatus = sanitizeText(value.paymentStatus);
  const notes = value.notes !== undefined ? sanitizeText(value.notes) : undefined;

  if (status && !ORDER_STATUS_VALUES.includes(status as never)) {
    return errorResponse("Invalid order status.", 422);
  }

  if (paymentStatus && !PAYMENT_STATUS_VALUES.includes(paymentStatus as never)) {
    return errorResponse("Invalid payment status.", 422);
  }

  try {
    const order = await updateOrderState({
      id,
      status: status ? (status as never) : undefined,
      paymentStatus: paymentStatus ? (paymentStatus as never) : undefined,
      notes,
    });

    if (!order) {
      return errorResponse("Order not found.", 404);
    }

    return successResponse({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update order.";
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
    return errorResponse("Invalid order id.", 422);
  }

  try {
    const order = await updateOrderState({ id, status: "CANCELLED" });
    if (!order) {
      return errorResponse("Order not found.", 404);
    }

    return successResponse({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to cancel order.";
    return errorResponse(message, 409);
  }
}
