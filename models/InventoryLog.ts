import { Model, Schema, Types, model, models } from "mongoose";

import { INVENTORY_CHANGE_TYPE_VALUES, type InventoryChangeType } from "@/lib/constants";

export type InventoryLogDocument = {
  _id: string;
  productId: Types.ObjectId | string;
  changeType: InventoryChangeType;
  quantity: number;
  reason: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

const inventoryLogSchema = new Schema<InventoryLogDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    changeType: {
      type: String,
      enum: INVENTORY_CHANGE_TYPE_VALUES,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const InventoryLogModel =
  (models.InventoryLog as Model<InventoryLogDocument>) ||
  model<InventoryLogDocument>("InventoryLog", inventoryLogSchema);
