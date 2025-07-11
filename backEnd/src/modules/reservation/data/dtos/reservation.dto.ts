import { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";
import { VehicleModel } from "../../../parkingSubscriptionFee/data/dtos/vehicle.dto";
import { ParkingAreaModel } from "../../../parkingArea/data/dtos/parkingArea.dto";

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}
export enum ReservationType {
  PRE_BOOKING = "pre_booking",
  ON_SPOT = "on_spot",
}
export enum PaymentStatus{
  PENDING = "pending",
  PAID = "paid",
  REFUNDED = "refunded",
}

export interface ReservationModel extends BaseDTO {
  parkingSlot: ObjectId;
  parkingArea: ObjectId | ParkingAreaModel;
  user: ObjectId;
  type: ReservationType;
  perHourRate: number;
  vehicleNumber: string;
  customerMobile: string;
  startDateAndTime: Date;
  endDateAndTime?: Date;
  totalAmount: number;
  vehicleType: ObjectId | VehicleModel;
  status: ReservationStatus;
  paymentIds: ObjectId[];
  paymentStatus: PaymentStatus;
  isParked: boolean;
  isDeleted: boolean;
  createdBy: ObjectId;
  rating:ObjectId;
}

const ReservationSchema = new Schema<ReservationModel>(
  {
    parkingSlot: { type: Schema.Types.ObjectId, required: true, ref: "ParkingSlot" },
    parkingArea: { type: Schema.Types.ObjectId, required: true, ref: "ParkingArea" },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true, enum: ReservationType, default: ReservationType.PRE_BOOKING },
    perHourRate: { type: Number, required: true },
    vehicleNumber: { type: String, required: true ,trim:true,lowercase:true},
    customerMobile: { type: String, required: true },
    startDateAndTime: { type: Date, required: true, default: Date.now },
    endDateAndTime: { type: Date },
    vehicleType: { type: Schema.Types.ObjectId, required: true, ref: "Vehicle" },
    totalAmount: { type: Number },
    status: { 
      type: String, 
      required: true, 
      enum: ReservationStatus,
      default: ReservationStatus.PENDING
    },
    paymentStatus: { 
      type: String, 
      required: true, 
      enum: PaymentStatus,
      default: PaymentStatus.PENDING
    },
    paymentIds: { type: [Schema.Types.ObjectId], required: true ,ref: "ReservationPayment"},
    isParked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    rating: { type: Schema.Types.ObjectId, required: false, ref: "Rating" },
  },
  { timestamps: true }
);



export const ReservationDTO = model<ReservationModel>("Reservation", ReservationSchema); 