import mongoose, { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface RatingModel extends BaseDTO {
    rating: number;
    comment: string;
    userId: ObjectId;
    reservationId: ObjectId;
    parkingAreaId: ObjectId;
}


const RatingSchema = new Schema<RatingModel>({
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    reservationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Reservation" },
    parkingAreaId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "ParkingArea" },
  });

  export const RatingModel = model<RatingModel>("Rating", RatingSchema);