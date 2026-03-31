import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";

import { errorResponse } from "@/lib/api";
import { USER_ROLES } from "@/lib/constants";
import { getCurrentDatabaseUser } from "@/lib/users";

export async function ensureAdminRequest() {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, response: errorResponse("Unauthorized.", 401) };
  }

  const user = await getCurrentDatabaseUser();
  const isUserActive = user?.isActive ?? true;

  if (!user || user.role !== USER_ROLES.ADMIN || !isUserActive) {
    return { ok: false as const, response: errorResponse("Forbidden.", 403) };
  }

  return { ok: true as const, user };
}

export function isValidObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function sanitizeNumber(value: unknown, fallback = 0) {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function sanitizeBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeText(item))
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function computePaymentStatus(billAmount: number, amountReceived: number) {
  if (amountReceived >= billAmount) {
    return "PAID" as const;
  }

  if (amountReceived > 0) {
    return "PARTIAL" as const;
  }

  return "UNPAID" as const;
}

export function calculateBalanceDue(billAmount: number, amountReceived: number) {
  return Math.max(0, billAmount - amountReceived);
}

export function inventoryStatus(stock: number, threshold: number) {
  if (stock <= 0) {
    return "OUT";
  }

  if (stock <= threshold) {
    return "LOW";
  }

  return "IN";
}
