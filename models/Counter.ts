import { Model, Schema, model, models } from "mongoose";

export type CounterDocument = {
  _id: string;
  sequenceValue: number;
};

const counterSchema = new Schema<CounterDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    sequenceValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
  },
);

export const CounterModel =
  (models.Counter as Model<CounterDocument>) ||
  model<CounterDocument>("Counter", counterSchema);
