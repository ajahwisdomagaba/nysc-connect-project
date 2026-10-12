import mongoose, { Schema } from "mongoose";
const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lgas: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: false },
);

locationSchema.index({ state: 1 });

export default mongoose.model("Location", locationSchema);
