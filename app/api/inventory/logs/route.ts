import { successResponse } from "@/lib/api";
import { ensureAdminRequest } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { InventoryLogModel } from "@/models/InventoryLog";

export const runtime = "nodejs";

export async function GET() {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  await connectToDatabase();
  const logs = await InventoryLogModel.find()
    .populate("productId", "name sku stock")
    .sort({ date: -1 })
    .lean();

  return successResponse({ logs });
}
