import { Model, Schema, Types, model, models } from "mongoose";

import { PAYMENT_STATUS_VALUES, type PaymentStatus } from "@/lib/constants";

type LedgerProduct = {
  name: string;
  qty: number;
};

export type LedgerDocument = {
  _id: string;
  buyerId: Types.ObjectId | string;
  date: Date;
  orderId?: string;
  entryId: string;
  products: LedgerProduct[];
  billAmount: number;
  amountReceived: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
};

const ledgerProductSchema = new Schema<LedgerProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const ledgerSchema = new Schema<LedgerDocument>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    orderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    entryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    products: {
      type: [ledgerProductSchema],
      default: [],
    },
    billAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: "UNPAID",
      index: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const LedgerModel =
  (models.Ledger as Model<LedgerDocument>) || model<LedgerDocument>("Ledger", ledgerSchema);
