import { Model, Schema, model, models } from "mongoose";

import { USER_ROLE_VALUES, type UserRole } from "@/lib/constants";

export type UserDocument = {
  _id: string;
  clerkId?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyName?: string;
  address?: string;
  gstin?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    clerkId: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: "USER",
      index: true,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    gstin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
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

export const UserModel =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);
