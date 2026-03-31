export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export const INVENTORY_CHANGE_TYPES = {
  IN: "IN",
  OUT: "OUT",
} as const;

export type InventoryChangeType =
  (typeof INVENTORY_CHANGE_TYPES)[keyof typeof INVENTORY_CHANGE_TYPES];

export const INVENTORY_CHANGE_TYPE_VALUES = Object.values(INVENTORY_CHANGE_TYPES);

export const PAYMENT_STATUSES = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  UNPAID: "UNPAID",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES);

export const ORDER_STATUSES = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);
