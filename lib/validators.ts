import { USER_ROLE_VALUES, type UserRole } from "@/lib/constants";

export function isValidObjectPayload(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLE_VALUES.includes(value as UserRole);
}

export function validateRolePayload(body: unknown) {
  if (!isValidObjectPayload(body)) {
    return { ok: false as const, error: "Invalid request body." };
  }

  const userId = normalizeString(body.userId);
  const role = normalizeString(body.role);

  if (!userId) {
    return { ok: false as const, error: "userId is required." };
  }

  if (!isUserRole(role)) {
    return { ok: false as const, error: "role must be ADMIN or USER." };
  }

  return {
    ok: true as const,
    data: {
      userId,
      role,
    },
  };
}
