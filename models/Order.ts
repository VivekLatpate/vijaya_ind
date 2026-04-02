import { Model, Schema, Types, model, models } from "mongoose";

import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";

export type OrderLineItem = {
  productId: Types.ObjectId | string;
  name: string;
  sku: string;
  price: number;
  gstRate: number;
  quantity: number;
};

export type OrderDocument = {
  _id: string;
  orderId: string;
  buyerId: Types.ObjectId | string;
  products: OrderLineItem[];
  totalAmount: number;
  gstAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  address: string;
  notes: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
};

const orderLineItemSchema = new Schema<OrderLineItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: {
      type: [orderLineItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: "PLACED",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "CREDIT",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: "UNPAID",
      index: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel =
  (models.Order as Model<OrderDocument>) || model<OrderDocument>("Order", orderSchema);
