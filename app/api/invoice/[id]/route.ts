import { NextResponse } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, isValidObjectId } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { generateFallbackInvoicePdf, generateInvoicePdf, sendInvoiceEmail } from "@/lib/invoice";
import { InvoiceModel } from "@/models/Invoice";
import { UserModel } from "@/models/User";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildEmergencyPdf(lines: string[]) {
  const safeLines = lines.map((line) => escapePdfText(line)).slice(0, 20);
  const textCommands = safeLines
    .map((line, index) => `1 0 0 1 40 ${800 - index * 22} Tm (${line}) Tj`)
    .join("\n");
  const streamContent = `BT\n/F1 12 Tf\n${textCommands}\nET`;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function GET(request: Request, context: RouteContext) {
  const format = new URL(request.url).searchParams.get("format");
  try {
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
    if (format === "pdf") {
      let pdf: Buffer;
      try {
        pdf = await generateInvoicePdf(invoice, {
          name: buyer?.name ?? "Buyer",
          email: buyer?.email ?? "",
          companyName: buyer?.companyName,
          address: buyer?.address,
          gstin: buyer?.gstin,
        });
      } catch (pdfError) {
        console.error("[invoice] primary PDF render failed, using fallback.", {
          invoiceId: id,
          error: pdfError,
        });
        pdf = await generateFallbackInvoicePdf(invoice, {
          name: buyer?.name ?? "Buyer",
          email: buyer?.email ?? "",
          companyName: buyer?.companyName,
          address: buyer?.address,
          gstin: buyer?.gstin,
        });
      }

      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        },
      });
    }

    if (format === "email") {
      if (!buyer?.email) {
        return errorResponse("Buyer email is not available for this invoice.", 422);
      }

      const pdf = await generateInvoicePdf(invoice, {
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

      if (!emailResult.sent) {
        return errorResponse(emailResult.message, 503);
      }

      return successResponse({ invoice, emailResult });
    }

    return successResponse({ invoice, buyer });
  } catch (error) {
    if (format === "pdf") {
      const message = error instanceof Error ? error.message : "Unknown PDF generation error.";
      const emergencyPdf = buildEmergencyPdf([
        "INVOICE DOWNLOAD",
        "Primary PDF rendering failed.",
        "A fallback PDF is generated so download still works.",
        `Error: ${message.slice(0, 140)}`,
        `Generated: ${new Date().toISOString()}`,
      ]);
      return new NextResponse(new Uint8Array(emergencyPdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="invoice-fallback.pdf"',
        },
      });
    }

    const message = error instanceof Error ? error.message : "Failed to process invoice request.";
    return errorResponse(message, 500);
  }
}
