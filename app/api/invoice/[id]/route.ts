import { NextResponse } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, isValidObjectId } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { renderInvoicePdf, sendInvoiceEmail } from "@/lib/invoice";
import { InvoiceModel } from "@/models/Invoice";
import { UserModel } from "@/models/User";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid invoice id.", 422);
  }

  await connectToDatabase();
  const invoice = await InvoiceModel.findById(id).lean();
  if (!invoice) {
    return errorResponse("Invoice not found.", 404);
  }

  const buyer = await UserModel.findById(invoice.buyerId).lean();
  const format = new URL(request.url).searchParams.get("format");

  if (format === "pdf") {
    const pdf = await renderInvoicePdf(invoice, {
      name: buyer?.name ?? "Buyer",
      email: buyer?.email ?? "",
      companyName: buyer?.companyName,
      address: buyer?.address,
      gstin: buyer?.gstin,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  }

  if (format === "email" && buyer?.email) {
    const pdf = await renderInvoicePdf(invoice, {
      name: buyer.name,
      email: buyer.email,
      companyName: buyer.companyName,
      address: buyer.address,
      gstin: buyer.gstin,
    });

    const emailResult = await sendInvoiceEmail({
      to: buyer.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      pdf,
      filename: `${invoice.invoiceNumber}.pdf`,
    });

    return successResponse({ invoice, emailResult });
  }

  return successResponse({ invoice, buyer });
}
