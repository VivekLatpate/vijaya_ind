import nodemailer from "nodemailer";

import type { InvoiceDocument } from "@/models/Invoice";

type BuyerInfo = {
  name: string;
  email: string;
  companyName?: string;
  address?: string;
  gstin?: string;
};

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function buildPdfBuffer(lines: string[]) {
  const pageHeight = 842;
  const startY = 800;
  const lineHeight = 18;

  const contentLines = [
    "BT",
    "/F1 12 Tf",
    `1 0 0 1 40 ${startY} Tm`,
  ];

  lines.forEach((line, index) => {
    if (index === 0) {
      contentLines.push(`(${escapePdfText(line)}) Tj`);
      return;
    }

    contentLines.push(`0 -${lineHeight} Td`);
    contentLines.push(`(${escapePdfText(line)}) Tj`);
  });

  contentLines.push("ET");
  const contentStream = contentLines.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function renderInvoicePdf(invoice: InvoiceDocument, buyer: BuyerInfo) {
  const lines = [
    "VIJAYA INDUSTRIES",
    "GST No. 27AQXPC1055E1ZW",
    "GST Invoice",
    "",
    `Invoice Number: ${invoice.invoiceNumber}`,
    `Order ID: ${invoice.orderId || "-"}`,
    `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`,
    "",
    `Buyer: ${buyer.companyName || buyer.name}`,
    `Email: ${buyer.email || "-"}`,
    `Address: ${buyer.address || "-"}`,
    `GSTIN: ${buyer.gstin || "-"}`,
    "",
    "Items:",
    ...invoice.items.map(
      (item, index) =>
        `${index + 1}. ${item.name} (${item.sku}) x${item.quantity} @ ${formatCurrency(item.price)} = ${formatCurrency(item.lineTotal)}`,
    ),
    "",
    `CGST: ${formatCurrency(invoice.gstBreakup.cgst)}`,
    `SGST: ${formatCurrency(invoice.gstBreakup.sgst)}`,
    `IGST: ${formatCurrency(invoice.gstBreakup.igst)}`,
    `Total Amount: ${formatCurrency(invoice.totalAmount)}`,
  ];

  return buildPdfBuffer(lines);
}

export async function sendInvoiceEmail(params: {
  to: string;
  subject: string;
  pdf: Buffer;
  filename: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !port || !user || !pass || !from) {
    return { sent: false, message: "SMTP is not configured." };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: "Please find your invoice attached.",
    attachments: [
      {
        filename: params.filename,
        content: params.pdf,
      },
    ],
  });

  return { sent: true, message: "Invoice emailed successfully." };
}
