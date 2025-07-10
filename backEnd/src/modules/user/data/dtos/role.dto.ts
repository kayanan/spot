import { Schema, model } from 'mongoose';
import { BaseDTO } from '../../../base/data/dtos/base.dto';
export interface RoleModel extends BaseDTO {
  name: string;
  type: string;
  isActive?: boolean;
  description?: string;
}

const RoleSchema = new Schema<RoleModel>(
  {
    
    type: { type: String, required: true, uppercase: true, unique: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RoleDTO = model<RoleModel>('Role', RoleSchema);
