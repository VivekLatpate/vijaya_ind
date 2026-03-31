import { NextResponse } from "next/server";

import { inventoryStatus, ensureAdminRequest } from "@/lib/admin";
import { successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { buildWorkbookBuffer } from "@/lib/export";
import { ProductModel } from "@/models/Product";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  await connectToDatabase();
  const products = await ProductModel.find().populate("category", "name").lean();
  const rows = products.map((product) => ({
    Name: product.name,
    SKU: product.sku,
    Category:
      typeof product.category === "object" && product.category && "name" in product.category
        ? product.category.name
        : "",
    Stock: product.stock,
    Price: product.price,
    Value: Number((product.stock * product.price).toFixed(2)),
    Status: inventoryStatus(product.stock, product.lowStockThreshold),
  }));

  const totalValue = rows.reduce((sum, row) => sum + Number(row.Value), 0);
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "excel") {
    const buffer = buildWorkbookBuffer(rows, "Inventory");
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="inventory-report.xlsx"',
      },
    });
  }

  return successResponse({ products: rows, totalValue });
}
