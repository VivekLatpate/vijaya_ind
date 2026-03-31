import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeBoolean,
  sanitizeNumber,
  sanitizeStringArray,
  sanitizeText,
} from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { ProductModel } from "@/models/Product";

export const runtime = "nodejs";

function validateProductBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Invalid request body." };
  }

  const value = body as Record<string, unknown>;
  const name = sanitizeText(value.name);
  const sku = sanitizeText(value.sku).toUpperCase();
  const category = sanitizeText(value.category);

  if (!name || !sku || !category || !isValidObjectId(category)) {
    return { ok: false as const, error: "name, sku, and a valid category are required." };
  }

  const images = sanitizeStringArray(value.images).slice(0, 5);

  return {
    ok: true as const,
    data: {
      name,
      sku,
      category,
      brand: sanitizeText(value.brand),
      model: sanitizeText(value.model),
      description: sanitizeText(value.description),
      images,
      price: sanitizeNumber(value.price),
      gstRate: sanitizeNumber(value.gstRate),
      moq: sanitizeNumber(value.moq, 1),
      stock: sanitizeNumber(value.stock),
      lowStockThreshold: sanitizeNumber(value.lowStockThreshold, 5),
      isActive:
        typeof value.isActive === "boolean" ? sanitizeBoolean(value.isActive, true) : true,
    },
  };
}

export async function GET(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  await connectToDatabase();
  const url = new URL(request.url);
  const search = sanitizeText(url.searchParams.get("search"));
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
    ];
  }

  const products = await ProductModel.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return successResponse({ products });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = await request.json().catch(() => null);
  const validated = validateProductBody(body);
  if (!validated.ok) {
    return errorResponse(validated.error, 422);
  }

  const category = await CategoryModel.findById(validated.data.category).lean();
  if (!category) {
    return errorResponse("Category not found.", 404);
  }

  try {
    const product = await ProductModel.create(validated.data);
    const populated = await ProductModel.findById(product._id)
      .populate("category", "name slug")
      .lean();

    return successResponse({ product: populated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    return errorResponse(message, 409);
  }
}
