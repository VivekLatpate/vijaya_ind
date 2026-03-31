import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeNumber,
  sanitizeText,
} from "@/lib/admin";
import { ensureInvoiceForOrder, nextSequence } from "@/lib/business";
import { connectToDatabase } from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/invoice";
import { InvoiceModel } from "@/models/Invoice";
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
  const orderId = sanitizeText(value.orderId);
  if (orderId) {
    try {
      const invoice = await ensureInvoiceForOrder(orderId);
      return successResponse({ invoice }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate invoice.";
      return errorResponse(message, 409);
    }
  }

  const buyerId = sanitizeText(value.buyerId);
  if (!isValidObjectId(buyerId)) {
    return errorResponse("Valid buyerId is required for a manual invoice.", 422);
  }

  const items = Array.isArray(value.items)
    ? value.items
        .map((item: unknown) => {
          const value = item as Record<string, unknown>;
          return {
            name: sanitizeText(value.name),
            sku: sanitizeText(value.sku).toUpperCase(),
            quantity: sanitizeNumber(value.quantity, 1),
            price: sanitizeNumber(value.price),
            gstRate: sanitizeNumber(value.gstRate),
            lineTotal: sanitizeNumber(value.lineTotal),
          };
        })
        .filter((item: { name: string; sku: string }) => item.name && item.sku)
    : [];

  const invoice = await InvoiceModel.create({
    invoiceNumber: await nextSequence("INV"),
    buyerId,
    items,
    gstBreakup: {
      cgst: sanitizeNumber((value.gstBreakup as Record<string, unknown> | undefined)?.cgst),
      sgst: sanitizeNumber((value.gstBreakup as Record<string, unknown> | undefined)?.sgst),
      igst: sanitizeNumber((value.gstBreakup as Record<string, unknown> | undefined)?.igst),
    },
    totalAmount: sanitizeNumber(value.totalAmount),
  });

  if (value.sendEmail) {
    await connectToDatabase();
    const buyer = await UserModel.findById(buyerId).lean();
    if (buyer?.email) {
      await sendInvoiceEmail({
        to: buyer.email,
        subject: `Invoice ${invoice.invoiceNumber}`,
        pdf: Buffer.from(
          "Manual invoice email configured. Use GET /api/invoice/:id?format=pdf for PDF.",
        ),
        filename: `${invoice.invoiceNumber}.txt`,
      });
    }
  }

  return successResponse({ invoice }, { status: 201 });
}
