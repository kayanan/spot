import { Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface CityModel extends BaseDTO {
  name: string;
  isActive: boolean;
  districtId: Schema.Types.ObjectId | String;
  isDeleted: boolean;
  description?: string;
}

const CitySchema = new Schema<CityModel>(
  {
    name: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    districtId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "District",
    },
    description: { type: String },
  },
  { timestamps: true }
);

export const CityDTO = model<CityModel>("City", CitySchema);
