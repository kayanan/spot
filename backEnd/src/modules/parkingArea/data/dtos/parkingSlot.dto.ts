import { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface ParkingSlotModel extends BaseDTO {
  parkingAreaId: Schema.Types.ObjectId | String;
  slotNumber: number;
  vehicleType: ObjectId;
  slotDescription: string;
  slotImage: string;
  slotSize: number;
  slotPrice: number;
  reservationIds: Array<ObjectId>;
  isOccupied: boolean;
  isActive: boolean;
  isDeleted: boolean;
}

const ParkingSlotSchema = new Schema<ParkingSlotModel>(
  {
    parkingAreaId: { type: Schema.Types.ObjectId, ref: "ParkingArea" },
    vehicleType: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    slotDescription: { type: String, required: false },
    slotImage: { type: String, required: false },
    slotSize: { type: Number, required: false },
    slotPrice: { type: Number, required: false },
    slotNumber: { type: Number, required: true },
    reservationIds: { type: [Schema.Types.ObjectId], ref: "Reservation", required: false },
    isOccupied: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ParkingSlotDTO = model<ParkingSlotModel>("ParkingSlot", ParkingSlotSchema);
