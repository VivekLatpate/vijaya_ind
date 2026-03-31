import { errorResponse, successResponse } from "@/lib/api";
import { ensureAdminRequest, sanitizeText } from "@/lib/admin";
import { createManualBuyer, listBuyersWithMetrics } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const users = await listBuyersWithMetrics();
  return successResponse({ users });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 422);
  }

  const value = body as Record<string, unknown>;
  const name = sanitizeText(value.name);
  const email = sanitizeText(value.email);

  if (!name || !email) {
    return errorResponse("name and email are required.", 422);
  }

  try {
    const user = await createManualBuyer({
      name,
      email,
      phone: sanitizeText(value.phone),
      companyName: sanitizeText(value.companyName),
      address: sanitizeText(value.address),
      gstin: sanitizeText(value.gstin),
    });

    return successResponse({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create buyer.";
    return errorResponse(message, 409);
  }
}
