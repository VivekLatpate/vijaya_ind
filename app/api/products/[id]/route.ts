import { errorResponse, successResponse } from "@/lib/api";
import {
  ensureAdminRequest,
  isValidObjectId,
  sanitizeBoolean,
  sanitizeNumber,
  sanitizeStringArray,
  sanitizeText,
} from "@/lib/admin";
import { CategoryModel } from "@/models/Category";
import { ProductModel } from "@/models/Product";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid product id.", 422);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};
  if (value.name !== undefined) {
    const name = sanitizeText(value.name);
    if (!name) {
      return errorResponse("Product name cannot be empty.", 422);
    }
    updateData.name = name;
  }
  if (value.sku !== undefined) {
    const sku = sanitizeText(value.sku).toUpperCase();
    if (!sku) {
      return errorResponse("Product SKU cannot be empty.", 422);
    }
    updateData.sku = sku;
  }
  if (value.brand !== undefined) updateData.brand = sanitizeText(value.brand);
  if (value.model !== undefined) updateData.model = sanitizeText(value.model);
  if (value.description !== undefined) updateData.description = sanitizeText(value.description);
  if (value.images !== undefined) updateData.images = sanitizeStringArray(value.images).slice(0, 5);
  if (value.price !== undefined) updateData.price = sanitizeNumber(value.price);
  if (value.gstRate !== undefined) updateData.gstRate = sanitizeNumber(value.gstRate);
  if (value.moq !== undefined) updateData.moq = sanitizeNumber(value.moq, 1);
  if (value.stock !== undefined) updateData.stock = sanitizeNumber(value.stock);
  if (value.lowStockThreshold !== undefined) {
    updateData.lowStockThreshold = sanitizeNumber(value.lowStockThreshold, 5);
  }
  if (typeof value.isActive === "boolean") updateData.isActive = sanitizeBoolean(value.isActive);

  if (!Object.keys(updateData).length && value.category === undefined) {
    return errorResponse("Provide at least one product field to update.", 422);
  }

  if (value.category !== undefined) {
    const categoryId = sanitizeText(value.category);
    if (!isValidObjectId(categoryId)) {
      return errorResponse("Invalid category id.", 422);
    }

    const category = await CategoryModel.findById(categoryId).lean();
    if (!category) {
      return errorResponse("Category not found.", 404);
    }

    updateData.category = categoryId;
  }

  let product;
  try {
    product = await ProductModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("category", "name slug")
      .lean();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    return errorResponse(message, 422);
  }

  if (!product) {
    return errorResponse("Product not found.", 404);
  }

  return successResponse({ product });
}

export async function DELETE(_: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid product id.", 422);
  }

  const product = await ProductModel.findByIdAndDelete(id).lean();
  if (!product) {
    return errorResponse("Product not found.", 404);
  }

  return successResponse({ deletedId: id });
}
