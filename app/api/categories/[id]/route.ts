import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, isValidObjectId, sanitizeText, slugify } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
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
    return errorResponse("Invalid category id.", 422);
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);
  if (!name) {
    return errorResponse("Category name is required.", 422);
  }

  const category = await CategoryModel.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    { returnDocument: "after" },
  ).lean();

  if (!category) {
    return errorResponse("Category not found.", 404);
  }

  return successResponse({ category });
}

export async function DELETE(_: Request, context: RouteContext) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid category id.", 422);
  }

  await connectToDatabase();
  const linkedProducts = await ProductModel.countDocuments({ category: id });
  if (linkedProducts > 0) {
    return errorResponse("Delete or reassign products in this category first.", 409);
  }

  const category = await CategoryModel.findByIdAndDelete(id).lean();
  if (!category) {
    return errorResponse("Category not found.", 404);
  }

  return successResponse({ deletedId: id });
}
