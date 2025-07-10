import mongoose, { Schema, model, ObjectId } from 'mongoose';
import { BaseDTO } from '../../../base/data/dtos/base.dto';
import { HttpMethodEnum } from '@/modules/base/enums/http.method.enum';

export interface PermissionModel extends BaseDTO {
  role: Array<ObjectId>;
  access: AccessLevel;
  description?: string;
}

export interface AccessLevel {
  route: string;
  method: HttpMethodEnum;
}

const AccessSchema = new Schema<AccessLevel>(
  {
    route: { type: String, required: true }, // Route path
    method: {
      type: String,
      enum: Object.values(HttpMethodEnum), // Use enum values for allowed HTTP methods
      required: true,
    },
  },
  { _id: false }
);

const PermissionSchema = new Schema<PermissionModel>(
  {
    role: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Role',
      required: true,
    },
    access: { type: AccessSchema, required: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PermissionDTO = model<PermissionModel>(
  'Permission',
  PermissionSchema
);
