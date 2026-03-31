import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/admin";
import { createOrder } from "@/lib/business";
import { connectToDatabase } from "@/lib/db";
import { PAYMENT_STATUS_VALUES } from "@/lib/constants";
import { OrderModel } from "@/models/Order";

export const runtime = "nodejs";

export async function GET() {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  await connectToDatabase();
  const orders = await OrderModel.find()
    .populate("buyerId", "name email companyName phone address gstin")
    .sort({ createdAt: -1 })
    .lean();

  return successResponse({ orders });
}

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
  const buyerId = sanitizeText(value.buyerId);
  if (!isValidObjectId(buyerId)) {
    return errorResponse("Valid buyerId is required.", 422);
  }

  const products = Array.isArray(value.products)
    ? value.products
        .map((item: unknown) => {
          const value = item as Record<string, unknown>;
          return {
            productId: sanitizeText(value.productId),
            quantity: sanitizeNumber(value.quantity, 1),
          };
        })
        .filter(
          (item: { productId: string; quantity: number }) =>
            isValidObjectId(item.productId) && item.quantity > 0,
        )
    : [];

  if (!products.length) {
    return errorResponse("At least one order item is required.", 422);
  }

  const paymentStatus = sanitizeText(value.paymentStatus) || "UNPAID";
  if (!PAYMENT_STATUS_VALUES.includes(paymentStatus as never)) {
    return errorResponse("Invalid payment status.", 422);
  }

  try {
    const order = await createOrder({
      buyerId,
      products,
      paymentMethod: sanitizeText(value.paymentMethod) || "CREDIT",
      paymentStatus: paymentStatus as "PAID" | "PARTIAL" | "UNPAID",
      address: sanitizeText(value.address),
      notes: sanitizeText(value.notes),
    });

    return successResponse({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return errorResponse(message, 409);
  }
}
