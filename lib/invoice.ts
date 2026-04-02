import path from "path";

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

import type { InvoiceDocument } from "@/models/Invoice";

type BuyerInfo = {
  name: string;
  email: string;
  companyName?: string;
  address?: string;
  gstin?: string;
};

const COMPANY = {
  name: "VIJAYA INDUSTRIES",
  tagline: "High-Quality Automobile Clips Solutions",
  address:
    "Plot No. PAP-203, A-Sector, Near LIBBHER Chowk,\nShendra Five Star MIDC, Chh. Sambhaji Nagar - 431006",
  phone: "+91 93260 00050",
  email: "vijayaindustries.inc@gmail.com",
  website: "www.vijayaindustries.in",
  gstin: "27AQXPC1055E1ZW",
  state: "Maharashtra (27)",
};

const TEAL = "#0D7377";
const DARK_GREY = "#2D2D2D";
const MID_GREY = "#777777";
const LIGHT_BG = "#F5F5F5";
const WHITE = "#FFFFFF";
const FONT_DIR = path.join(process.cwd(), "public", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "arial.ttf");
const FONT_BOLD = path.join(FONT_DIR, "arialbd.ttf");
const FONT_ITALIC = path.join(FONT_DIR, "ariali.ttf");

// Stamp image — place your stamp PNG at public/images/stamp.png
const STAMP_PATH = path.join(process.cwd(), "public", "images", "stamp.png");

const FONT_NAMES = {
  regular: "InvoiceRegular",
  bold: "InvoiceBold",
  italic: "InvoiceItalic",
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function amountInWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function belowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return `${ones[n]} `;
    if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""} `;
    return `${ones[Math.floor(n / 100)]} Hundred ${belowThousand(n % 100)}`;
  }

  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const parts: string[] = [];

  if (rupees >= 10000000) {
    parts.push(`${belowThousand(Math.floor(rupees / 10000000)).trim()} Crore`);
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    parts.push(`${belowThousand(Math.floor(rupees / 100000)).trim()} Lakh`);
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    parts.push(`${belowThousand(Math.floor(rupees / 1000)).trim()} Thousand`);
    rupees %= 1000;
  }
  if (rupees > 0) {
    parts.push(belowThousand(rupees).trim());
  }

  let result = `${parts.join(" ").trim()} Rupees`;
  if (paise) {
    result += ` and ${belowThousand(paise).trim()} Paise`;
  }
  return `${result} Only`;
}

export async function renderInvoicePdf(
  invoice: InvoiceDocument,
  buyer: BuyerInfo,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      font: FONT_REGULAR,
    });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))));
    doc.on("error", reject);

    doc.registerFont(FONT_NAMES.regular, FONT_REGULAR);
    doc.registerFont(FONT_NAMES.bold, FONT_BOLD);
    doc.registerFont(FONT_NAMES.italic, FONT_ITALIC);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 30;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const rect = (
      x: number,
      y: number,
      width: number,
      height: number,
      fill: string,
      radius = 0,
    ) => {
      doc.save().roundedRect(x, y, width, height, radius).fill(fill).restore();
    };

    const hline = (
      y: number,
      x1 = margin,
      x2 = pageWidth - margin,
      color = "#DDDDDD",
      width = 0.5,
    ) => {
      doc
        .save()
        .moveTo(x1, y)
        .lineTo(x2, y)
        .strokeColor(color)
        .lineWidth(width)
        .stroke()
        .restore();
    };

    const text = (
      value: string,
      x: number,
      y: number,
      options: {
        font?: string;
        size?: number;
        color?: string;
        width?: number;
        align?: "left" | "center" | "right";
        lineGap?: number;
        lineBreak?: boolean;
        ellipsis?: boolean;
      } = {},
    ) => {
      doc
        .font(options.font ?? FONT_NAMES.regular)
        .fontSize(options.size ?? 9)
        .fillColor(options.color ?? DARK_GREY)
        .text(value, x, y, {
          width: options.width,
          align: options.align ?? "left",
          lineGap: options.lineGap ?? 0,
          lineBreak: options.lineBreak !== false,
          ellipsis: options.ellipsis ?? false,
        });
    };

    const measureTextHeight = (
      value: string,
      options: {
        font?: string;
        size?: number;
        width?: number;
        lineGap?: number;
      } = {},
    ) => {
      doc.font(options.font ?? FONT_NAMES.regular).fontSize(options.size ?? 9);
      return doc.heightOfString(value, {
        width: options.width,
        lineGap: options.lineGap ?? 0,
      });
    };

    // ─── Header ───────────────────────────────────────────────────────────────

    const headerHeight = 124;
    rect(0, 0, pageWidth, headerHeight, TEAL);

    const leftHeaderWidth = 330;
    const rightHeaderWidth = 170;
    const tagX = pageWidth - margin - rightHeaderWidth;
    const companyAddress = COMPANY.address.replace("\n", ", ");
    let leftY = 14;

    doc
      .font(FONT_NAMES.bold)
      .fontSize(18)
      .fillColor(WHITE)
      .text(COMPANY.name, margin, leftY, {
        width: leftHeaderWidth,
        characterSpacing: 0.3,
      });
    leftY +=
      measureTextHeight(COMPANY.name, {
        font: FONT_NAMES.bold,
        size: 18,
        width: leftHeaderWidth,
      }) + 4;

    text(COMPANY.tagline, margin, leftY, {
      font: FONT_NAMES.regular,
      size: 7.5,
      color: WHITE,
      width: leftHeaderWidth,
    });
    leftY +=
      measureTextHeight(COMPANY.tagline, {
        font: FONT_NAMES.regular,
        size: 7.5,
        width: leftHeaderWidth,
      }) + 6;

    text(companyAddress, margin, leftY, {
      size: 7.5,
      color: WHITE,
      width: leftHeaderWidth,
      lineGap: 1,
    });
    leftY +=
      measureTextHeight(companyAddress, {
        size: 7.5,
        width: leftHeaderWidth,
        lineGap: 1,
      }) + 4;

    text(`Mob: ${COMPANY.phone}`, margin, leftY, {
      size: 7.5,
      color: WHITE,
      width: leftHeaderWidth,
    });
    leftY +=
      measureTextHeight(`Mob: ${COMPANY.phone}`, {
        size: 7.5,
        width: leftHeaderWidth,
      }) + 2;

    text(COMPANY.email, margin, leftY, {
      size: 7.5,
      color: WHITE,
      width: leftHeaderWidth,
    });
    leftY +=
      measureTextHeight(COMPANY.email, {
        size: 7.5,
        width: leftHeaderWidth,
      }) + 4;

    text(`GSTIN: ${COMPANY.gstin}`, margin, leftY, {
      size: 8,
      color: WHITE,
      font: FONT_NAMES.bold,
      width: leftHeaderWidth,
    });

    text("TAX INVOICE", tagX, 16, {
      font: FONT_NAMES.bold,
      size: 15,
      color: WHITE,
      width: rightHeaderWidth,
      align: "right",
    });

    let dateStr = "-";
    try {
      const createdAt = new Date(invoice.createdAt as unknown as string);
      dateStr = createdAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {}

    text(`Invoice No: ${invoice.invoiceNumber}`, tagX, 52, {
      size: 8,
      color: WHITE,
      width: rightHeaderWidth,
      align: "right",
    });
    text(`Order ID: ${invoice.orderId ?? "-"}`, tagX, 68, {
      size: 8,
      color: WHITE,
      width: rightHeaderWidth,
      align: "right",
    });
    text(`Date: ${dateStr}`, tagX, 84, {
      size: 8,
      color: WHITE,
      width: rightHeaderWidth,
      align: "right",
    });

    // ─── Bill To / Bill From panels ───────────────────────────────────────────

    let curY = headerHeight + 14;
    const panelWidth = (pageWidth - 2 * margin - 8) / 2;
    const buyerName = buyer.companyName || buyer.name;
    const buyerAddress = buyer.address ?? "-";
    const buyerEmail = `Email: ${buyer.email ?? "-"}`;
    const buyerGstin = `GSTIN: ${buyer.gstin ?? "-"}`;
    const sellerAddress = COMPANY.address;
    const sellerState = `State: ${COMPANY.state}`;
    const sellerGstin = `GSTIN: ${COMPANY.gstin}`;
    const panelHeight = Math.max(
      102,
      Math.ceil(
        Math.max(
          measureTextHeight(buyerName, { font: FONT_NAMES.bold, size: 9, width: panelWidth - 16 }) +
            measureTextHeight(buyerAddress, { size: 8, width: panelWidth - 16, lineGap: 1 }) +
            measureTextHeight(buyerEmail, { size: 8, width: panelWidth - 16 }) +
            measureTextHeight(buyerGstin, { font: FONT_NAMES.bold, size: 8, width: panelWidth - 16 }),
          measureTextHeight(COMPANY.name, { font: FONT_NAMES.bold, size: 9, width: panelWidth - 16 }) +
            measureTextHeight(sellerAddress, { size: 8, width: panelWidth - 16, lineGap: 2 }) +
            measureTextHeight(sellerState, { size: 8, width: panelWidth - 16 }) +
            measureTextHeight(sellerGstin, { font: FONT_NAMES.bold, size: 8, width: panelWidth - 16 }),
        ) + 34,
      ),
    );

    // Bill To
    rect(margin, curY, panelWidth, panelHeight, TEAL, 4);
    text("BILL TO", margin + 8, curY + 7, { font: FONT_NAMES.bold, size: 8, color: WHITE });
    rect(margin, curY + 20, panelWidth, panelHeight - 20, LIGHT_BG, 4);

    let buyerY = curY + 25;
    text(buyerName, margin + 8, buyerY, {
      font: FONT_NAMES.bold,
      size: 9,
      width: panelWidth - 16,
    });
    buyerY +=
      measureTextHeight(buyerName, {
        font: FONT_NAMES.bold,
        size: 9,
        width: panelWidth - 16,
      }) + 4;
    text(buyerAddress, margin + 8, buyerY, {
      size: 8,
      color: MID_GREY,
      width: panelWidth - 16,
      lineGap: 1,
    });
    buyerY +=
      measureTextHeight(buyerAddress, {
        size: 8,
        width: panelWidth - 16,
        lineGap: 1,
      }) + 8;
    text(buyerEmail, margin + 8, buyerY, {
      size: 8,
      color: MID_GREY,
      width: panelWidth - 16,
    });
    buyerY += measureTextHeight(buyerEmail, { size: 8, width: panelWidth - 16 }) + 4;
    text(buyerGstin, margin + 8, buyerY, {
      size: 8,
      color: MID_GREY,
      font: FONT_NAMES.bold,
      width: panelWidth - 16,
    });

    // Bill From
    const sellerX = margin + panelWidth + 8;
    rect(sellerX, curY, panelWidth, panelHeight, "#555555", 4);
    text("BILL FROM", sellerX + 8, curY + 7, { font: FONT_NAMES.bold, size: 8, color: WHITE });
    rect(sellerX, curY + 20, panelWidth, panelHeight - 20, LIGHT_BG, 4);

    let sellerY = curY + 25;
    text(COMPANY.name, sellerX + 8, sellerY, {
      font: FONT_NAMES.bold,
      size: 9,
      width: panelWidth - 16,
    });
    sellerY +=
      measureTextHeight(COMPANY.name, {
        font: FONT_NAMES.bold,
        size: 9,
        width: panelWidth - 16,
      }) + 4;
    text(sellerAddress, sellerX + 8, sellerY, {
      size: 8,
      color: MID_GREY,
      width: panelWidth - 16,
      lineGap: 2,
    });
    sellerY +=
      measureTextHeight(sellerAddress, {
        size: 8,
        width: panelWidth - 16,
        lineGap: 2,
      }) + 8;
    text(sellerState, sellerX + 8, sellerY, {
      size: 8,
      color: MID_GREY,
      width: panelWidth - 16,
    });
    sellerY += measureTextHeight(sellerState, { size: 8, width: panelWidth - 16 }) + 4;
    text(sellerGstin, sellerX + 8, sellerY, {
      size: 8,
      color: MID_GREY,
      font: FONT_NAMES.bold,
      width: panelWidth - 16,
    });

    curY += panelHeight + 14;

    // ─── Items table ──────────────────────────────────────────────────────────

    const cols = {
      no:    { x: margin,           w: 22 },
      name:  { x: margin + 22,      w: 170 },
      sku:   { x: margin + 192,     w: 110 },
      qty:   { x: margin + 302,     w: 45 },
      price: { x: margin + 347,     w: 60 },
      total: { x: margin + 407,     w: pageWidth - margin - (margin + 407) - margin },
    };

    const ROW_MIN_HEIGHT = 22;
    const tableHeaderHeight = 24;

    rect(margin, curY, pageWidth - 2 * margin, tableHeaderHeight, TEAL, 4);
    const thY = curY + 7;
    text("#",           cols.no.x + 4,    thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.no.w,    align: "center" });
    text("Description", cols.name.x + 4,  thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.name.w });
    text("SKU / Code",  cols.sku.x,        thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.sku.w });
    text("Qty",         cols.qty.x,        thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.qty.w,   align: "center" });
    text("Unit Price",  cols.price.x,      thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.price.w, align: "right" });
    text("Amount",      cols.total.x,      thY, { font: FONT_NAMES.bold, size: 8, color: WHITE, width: cols.total.w, align: "right" });

    curY += tableHeaderHeight;

    invoice.items.forEach((item, index) => {
      const bg = index % 2 === 0 ? WHITE : "#EDF7F7";

      // Measure how many lines the item name will wrap to
      const nameHeight = measureTextHeight(item.name, {
        font: FONT_NAMES.regular,
        size: 8,
        width: cols.name.w - 6,
        lineGap: 1,
      });
      const skuHeight = measureTextHeight(item.sku, {
        font: FONT_NAMES.regular,
        size: 7.5,
        width: cols.sku.w - 4,
        lineGap: 1,
      });
      const rowHeight = Math.max(ROW_MIN_HEIGHT, Math.ceil(Math.max(nameHeight, skuHeight) + 12));

      rect(margin, curY, pageWidth - 2 * margin, rowHeight, bg);
      hline(curY, margin, pageWidth - margin, "#E0E0E0");

      const rowY = curY + 6;

      text(String(index + 1), cols.no.x + 4, rowY, {
        size: 8,
        width: cols.no.w,
        align: "center",
      });

      // Item name — allow wrapping, row height already accounts for it
      text(item.name, cols.name.x + 4, rowY, {
        size: 8,
        width: cols.name.w - 6,
        lineGap: 1,
      });

      // SKU — single line with ellipsis to prevent overflow into summary
      text(item.sku, cols.sku.x, rowY, {
        size: 7.5,
        color: MID_GREY,
        width: cols.sku.w - 4,
        lineBreak: false,   // ← never wrap
        ellipsis: true,     // ← truncate with "…"
      });

      text(String(item.quantity), cols.qty.x, rowY, {
        size: 8,
        width: cols.qty.w,
        align: "center",
      });
      text(formatCurrency(item.price), cols.price.x, rowY, {
        size: 8,
        width: cols.price.w,
        align: "right",
      });
      text(formatCurrency(item.lineTotal), cols.total.x, rowY, {
        size: 8,
        width: cols.total.w,
        align: "right",
      });

      // Advance by the actual rendered row height
      curY += rowHeight;
    });

    hline(curY, margin, pageWidth - margin, TEAL, 1);
    curY += 10;

    // ─── Summary ──────────────────────────────────────────────────────────────

    const { cgst, sgst, igst } = invoice.gstBreakup;
    const totalAmount = invoice.totalAmount;
    const taxableAmount = totalAmount - cgst - sgst - igst;

    const summaryBlockWidth = 230;
    const summaryX = pageWidth - margin - summaryBlockWidth;
    const labelWidth = 120;
    const valueWidth = summaryBlockWidth - labelWidth - 8;
    const valueX = summaryX + labelWidth + 8;

    const addSummaryRow = (label: string, value: number, bold = false, last = false) => {
      if (last) {
        rect(summaryX - 8, curY - 3, summaryBlockWidth + 8, 22, TEAL, 4);
        text(label, summaryX, curY + 2, {
          font: FONT_NAMES.bold,
          size: 10,
          color: WHITE,
          width: labelWidth,
        });
        text(formatCurrency(value), valueX, curY + 2, {
          font: FONT_NAMES.bold,
          size: 10,
          color: WHITE,
          width: valueWidth,
          align: "right",
        });
        curY += 22;
        return;
      }

      text(label, summaryX, curY, {
        font: bold ? FONT_NAMES.bold : FONT_NAMES.regular,
        size: 8.5,
        width: labelWidth,
      });
      text(formatCurrency(value), valueX, curY, {
        font: bold ? FONT_NAMES.bold : FONT_NAMES.regular,
        size: 8.5,
        width: valueWidth,
        align: "right",
      });
      hline(curY + 14, summaryX - 8, pageWidth - margin, "#EEEEEE");
      curY += 16;
    };

    addSummaryRow("Taxable Amount", taxableAmount);
    addSummaryRow("CGST (9%)", cgst);
    addSummaryRow("SGST (9%)", sgst);
    if (igst) {
      addSummaryRow("IGST (18%)", igst);
    }
    curY += 2;
    addSummaryRow("TOTAL AMOUNT", totalAmount, true, true);

    // ─── Amount in words ──────────────────────────────────────────────────────

    curY += 8;
    doc
      .font(FONT_NAMES.italic)
      .fontSize(8)
      .fillColor(MID_GREY)
      .text(`Amount in Words: ${amountInWords(totalAmount)}`, margin, curY, {
        width: pageWidth - 2 * margin,
      });
    curY += 20;

    // ─── Divider ──────────────────────────────────────────────────────────────

    hline(curY, margin, pageWidth - margin, "#CCCCCC");
    curY += 10;

    // ─── Bank Details + Stamp & Signature ────────────────────────────────────

    text("Bank Details", margin, curY, { font: FONT_NAMES.bold, size: 8.5 });
    text("Bank Name: State Bank of India",        margin, curY + 14, { size: 8, color: MID_GREY });
    text("Account No: XXXXXXXXXXXX",              margin, curY + 26, { size: 8, color: MID_GREY });
    text("IFSC Code: SBIN0XXXXXX",               margin, curY + 38, { size: 8, color: MID_GREY });
    text("Branch: Shendra MIDC, Aurangabad",     margin, curY + 50, { size: 8, color: MID_GREY });

    // Stamp image — rendered above the signature line, right-aligned
    const stampSize = 80;                              // stamp is drawn as a square
    const signBlockWidth = 160;
    const signX = pageWidth - margin - signBlockWidth;
    const stampX = signX + (signBlockWidth - stampSize) / 2; // horizontally centred in sign block
    const stampY = curY;                               // top of bank-details row

    try {
      // Rendered with opacity so it looks like a real rubber stamp overlay
      doc.save().opacity(0.85);
      doc.image(STAMP_PATH, stampX, stampY, { width: stampSize, height: stampSize });
      doc.restore();
    } catch {
      // Stamp file missing — silently skip so invoice still renders
    }

    // Signature line sits below the stamp
    const sigLineY = curY + stampSize + 6;
    hline(sigLineY, signX, pageWidth - margin, DARK_GREY, 0.7);
    text("Authorised Signatory", signX, sigLineY + 4, {
      size: 8,
      color: MID_GREY,
      width: signBlockWidth,
      align: "right",
    });
    text("For Vijaya Industries", signX, sigLineY + 16, {
      size: 9,
      font: FONT_NAMES.bold,
      width: signBlockWidth,
      align: "right",
    });

    // ─── Footer ───────────────────────────────────────────────────────────────

    hline(pageHeight - 36, margin, pageWidth - margin, "#CCCCCC");
    doc
      .font(FONT_NAMES.regular)
      .fontSize(7.5)
      .fillColor(MID_GREY)
      .text(
        "This is a computer-generated invoice and does not require a physical signature. Thank you for your business!",
        margin,
        pageHeight - 30,
        { align: "center", width: pageWidth - 2 * margin },
      )
      .text(
        `Vijaya Industries  |  GSTIN: ${COMPANY.gstin}  |  ${COMPANY.email}  |  ${COMPANY.website}`,
        margin,
        pageHeight - 18,
        { align: "center", width: pageWidth - 2 * margin },
      );

    rect(0, pageHeight - 6, pageWidth, 6, TEAL);
    doc.end();
  });
}

// ─── Email ────────────────────────────────────────────────────────────────────

export async function generateInvoicePdf(
  invoice: InvoiceDocument,
  buyer: BuyerInfo,
): Promise<Buffer> {
  return renderInvoicePdf(invoice, buyer);
}

export async function generateFallbackInvoicePdf(
  invoice: InvoiceDocument,
  buyer: BuyerInfo,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))));
    doc.on("error", reject);

    const buyerName = buyer.companyName || buyer.name;
    const createdAt =
      invoice.createdAt != null ? new Date(invoice.createdAt as unknown as string) : new Date();
    const invoiceDate = Number.isNaN(createdAt.getTime())
      ? "-"
      : createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

    doc.font("Helvetica-Bold").fontSize(18).text("Tax Invoice");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Order ID: ${invoice.orderId ?? "-"}`);
    doc.text(`Date: ${invoiceDate}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Seller");
    doc.font("Helvetica");
    doc.text(COMPANY.name);
    doc.text(COMPANY.address.replace("\n", ", "));
    doc.text(`GSTIN: ${COMPANY.gstin}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Buyer");
    doc.font("Helvetica");
    doc.text(buyerName);
    doc.text(buyer.address ?? "-");
    doc.text(`Email: ${buyer.email || "-"}`);
    doc.text(`GSTIN: ${buyer.gstin ?? "-"}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Items");
    doc.moveDown(0.5);
    doc.font("Helvetica");
    invoice.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.name} | SKU: ${item.sku} | Qty: ${item.quantity} | Unit: ${formatCurrency(item.price)} | Total: ${formatCurrency(item.lineTotal)}`,
      );
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Summary");
    doc.font("Helvetica");
    doc.text(`CGST: ${formatCurrency(invoice.gstBreakup.cgst)}`);
    doc.text(`SGST: ${formatCurrency(invoice.gstBreakup.sgst)}`);
    doc.text(`IGST: ${formatCurrency(invoice.gstBreakup.igst)}`);
    doc.text(`Total Amount: ${formatCurrency(invoice.totalAmount)}`);
    doc.moveDown();
    doc.text(`Amount in Words: ${amountInWords(invoice.totalAmount)}`);

    doc.end();
  });
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
    text: "Please find your GST invoice attached.\n\nThank you for choosing Vijaya Industries.",
    attachments: [{ filename: params.filename, content: params.pdf }],
  });

  return { sent: true, message: "Invoice emailed successfully." };
}
