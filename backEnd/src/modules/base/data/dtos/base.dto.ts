import { Document } from 'mongoose';
export interface BaseDTO extends Document {
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
