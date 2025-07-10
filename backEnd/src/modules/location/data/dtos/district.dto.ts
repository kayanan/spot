import { Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface DistrictModel extends BaseDTO {
  provinceId: Schema.Types.ObjectId;
  name: string;
  isActive: boolean;
  description: string;
}

const DistrictSchema = new Schema<DistrictModel>(
  {
    name: { type: String, required: true, unique: true },
    provinceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Province",
    },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DistrictDTO = model<DistrictModel>("District", DistrictSchema);
