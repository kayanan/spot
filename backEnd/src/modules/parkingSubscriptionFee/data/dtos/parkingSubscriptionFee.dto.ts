import { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface ParkingSubscriptionFeeModel extends BaseDTO {
  startDate: Date;
  endDate: Date;
  vehicleType: ObjectId;
  below100:number;
  between100and300:number;
  between300and500:number;
  above500:number;
  isDeleted:boolean;
  createdBy:ObjectId;
}

const ParkingSubscriptionFeeSchema = new Schema<ParkingSubscriptionFeeModel>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    vehicleType: { type: Schema.Types.ObjectId, required: true, ref: "Vehicle" },
    below100: { type: Number, required: true },
    between100and300: { type: Number, required: true },
    between300and500: { type: Number, required: true },
    above500: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

ParkingSubscriptionFeeSchema.pre('save', async function (next) {    
    const existingFee = await ParkingSubscriptionFeeDTO.findOne({
        vehicleType: this.vehicleType,
        endDate: { $gt: this.startDate },
        isDeleted: false
    });
    if(existingFee){
        throw new Error('Fee already exists for this vehicle type and date range');
    }
  next();
});
export const ParkingSubscriptionFeeDTO = model<ParkingSubscriptionFeeModel>("ParkingSubscriptionFee", ParkingSubscriptionFeeSchema);
