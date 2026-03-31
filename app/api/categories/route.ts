import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, sanitizeText, slugify } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";

export const runtime = "nodejs";

export async function GET() {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  return successResponse({ categories });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = await request.json().catch(() => null);
  const name = sanitizeText(body?.name);

  if (!name) {
    return errorResponse("Category name is required.", 422);
  }

  try {
    const category = await CategoryModel.create({
      name,
      slug: slugify(name),
    });

    return successResponse({ category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create category.";
    return errorResponse(message, 409);
  }
}
