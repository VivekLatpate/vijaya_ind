import { Model, Schema, Types, model, models } from "mongoose";
import "@/models/Category";

export type ProductDocument = {
  _id: string;
  name: string;
  sku: string;
  category: Types.ObjectId | string;
  brand: string;
  model: string;
  description: string;
  images: string[];
  price: number;
  gstRate: number;
  moq: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    model: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
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
    moq: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel =
  (models.Product as Model<ProductDocument>) ||
  model<ProductDocument>("Product", productSchema);
