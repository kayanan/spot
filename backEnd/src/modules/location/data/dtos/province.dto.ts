import mongoose, { ObjectId, Schema, model } from 'mongoose';
import { BaseDTO } from '../../../base/data/dtos/base.dto';


export interface ProvinceModel extends BaseDTO {
  name: string;
  isActive: boolean;
  description: string;
}

const ProvinceSchema = new Schema<ProvinceModel>(
  {
    name: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const ProvinceDTO = model<ProvinceModel>(
  'Province',
  ProvinceSchema
);
