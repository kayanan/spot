import mongoose, { ObjectId, Schema, model } from 'mongoose';
import { BaseDTO } from '../../../base/data/dtos/base.dto';

export interface RevenueByRegionModel extends BaseDTO {
  provinceId: ObjectId;
  provinceName: string;
  totalRevenue: number;
  totalBookings: number;
  totalParkingAreas: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  reportDate: Date;
  isDeleted: boolean;
}

const RevenueByRegionSchema = new Schema<RevenueByRegionModel>(
  {
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      required: true,
      index: 1
    },
    provinceName: { 
      type: String, 
      required: true,
      trim: true
    },
    totalRevenue: { 
      type: Number, 
      required: true,
      default: 0
    },
    totalBookings: { 
      type: Number, 
      required: true,
      default: 0
    },
    totalParkingAreas: { 
      type: Number, 
      required: true,
      default: 0
    },
    currentMonthRevenue: { 
      type: Number, 
      required: true,
      default: 0
    },
    previousMonthRevenue: { 
      type: Number, 
      required: true,
      default: 0
    },
    growthPercentage: { 
      type: Number, 
      required: true,
      default: 0
    },
    reportDate: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
RevenueByRegionSchema.index({ provinceId: 1, reportDate: -1 });
RevenueByRegionSchema.index({ reportDate: -1 });
RevenueByRegionSchema.index({ totalRevenue: -1 });

export const RevenueByRegionDTO = model<RevenueByRegionModel>('RevenueByRegion', RevenueByRegionSchema); 