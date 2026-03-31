import { Model, Schema, model, models } from "mongoose";

export type CategoryDocument = {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel =
  (models.Category as Model<CategoryDocument>) ||
  model<CategoryDocument>("Category", categorySchema);
