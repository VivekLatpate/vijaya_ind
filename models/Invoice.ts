import { Model, Schema, Types, model, models } from "mongoose";

type InvoiceItem = {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  gstRate: number;
  lineTotal: number;
};

type GstBreakup = {
  cgst: number;
  sgst: number;
  igst: number;
};

export type InvoiceDocument = {
  _id: string;
  invoiceNumber: string;
  orderId?: string;
  buyerId: Types.ObjectId | string;
  items: InvoiceItem[];
  gstBreakup: GstBreakup;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

const invoiceItemSchema = new Schema<InvoiceItem>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    orderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
    gstBreakup: {
      cgst: { type: Number, required: true, min: 0, default: 0 },
      sgst: { type: Number, required: true, min: 0, default: 0 },
      igst: { type: Number, required: true, min: 0, default: 0 },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const InvoiceModel =
  (models.Invoice as Model<InvoiceDocument>) ||
  model<InvoiceDocument>("Invoice", invoiceSchema);
