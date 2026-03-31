import { errorResponse, successResponse } from "@/lib/api";
import {
  calculateBalanceDue,
  computePaymentStatus,
  ensureAdminRequest,
  isValidObjectId,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/admin";
import { nextSequence } from "@/lib/business";
import { connectToDatabase } from "@/lib/db";
import { LedgerModel } from "@/models/Ledger";
import { UserModel } from "@/models/User";

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
  const buyerId = sanitizeText(value.buyerId);
  if (!isValidObjectId(buyerId)) {
    return errorResponse("Valid buyerId is required.", 422);
  }

  await connectToDatabase();
  const buyer = await UserModel.findById(buyerId).lean();
  if (!buyer) {
    return errorResponse("Buyer not found.", 404);
  }

  const products = Array.isArray(value.products)
    ? value.products
        .map((item: unknown) => {
          const value = item as Record<string, unknown>;
          return {
            name: sanitizeText(value.name),
            qty: sanitizeNumber(value.qty, 1),
          };
        })
        .filter((item: { name: string; qty: number }) => item.name && item.qty > 0)
    : [];

  const billAmount = sanitizeNumber(value.billAmount);
  const amountReceived = sanitizeNumber(value.amountReceived);

  const entry = await LedgerModel.create({
    buyerId,
    date: value.date ? new Date(String(value.date)) : new Date(),
    orderId: sanitizeText(value.orderId),
    entryId: await nextSequence("LED"),
    products,
    billAmount,
    amountReceived,
    balanceDue: calculateBalanceDue(billAmount, amountReceived),
    paymentStatus: computePaymentStatus(billAmount, amountReceived),
    remarks: sanitizeText(value.remarks),
  });

  return successResponse({ entry }, { status: 201 });
}
