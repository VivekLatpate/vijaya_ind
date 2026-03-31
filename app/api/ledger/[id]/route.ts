import { errorResponse, successResponse } from "@/lib/api";
import {
  calculateBalanceDue,
  computePaymentStatus,
  ensureAdminRequest,
  isValidObjectId,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/admin";
import { computeBuyerProfileMetrics } from "@/lib/business";
import { connectToDatabase } from "@/lib/db";
import { LedgerModel } from "@/models/Ledger";
import { UserModel } from "@/models/User";

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
    return errorResponse("Invalid buyer id.", 422);
  }

  await connectToDatabase();
  const buyer = await UserModel.findById(id).lean();
  if (!buyer) {
    return errorResponse("Buyer not found.", 404);
  }

  const entries = await LedgerModel.find({ buyerId: id }).sort({ date: -1 }).lean();
  const summary = await computeBuyerProfileMetrics(id);

  return successResponse({ buyer, entries, summary });
}

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid ledger id.", 422);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};
  if (value.date) updateData.date = new Date(String(value.date));
  if (value.orderId !== undefined) updateData.orderId = sanitizeText(value.orderId);
  if (value.products !== undefined) {
    updateData.products = Array.isArray(value.products)
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
  }

  const billAmount =
    value.billAmount !== undefined ? sanitizeNumber(value.billAmount) : undefined;
  const amountReceived =
    value.amountReceived !== undefined ? sanitizeNumber(value.amountReceived) : undefined;

  if (billAmount !== undefined) updateData.billAmount = billAmount;
  if (amountReceived !== undefined) updateData.amountReceived = amountReceived;
  if (value.remarks !== undefined) updateData.remarks = sanitizeText(value.remarks);

  if (billAmount !== undefined || amountReceived !== undefined) {
    const existing = await LedgerModel.findById(id).lean();
    if (!existing) {
      return errorResponse("Ledger entry not found.", 404);
    }

    const nextBill = billAmount ?? existing.billAmount;
    const nextReceived = amountReceived ?? existing.amountReceived;
    updateData.balanceDue = calculateBalanceDue(nextBill, nextReceived);
    updateData.paymentStatus = computePaymentStatus(nextBill, nextReceived);
  }

  const entry = await LedgerModel.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
  }).lean();

  if (!entry) {
    return errorResponse("Ledger entry not found.", 404);
  }

  return successResponse({ entry });
}
