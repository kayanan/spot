import mongoose, { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";
import { ParkingAreaModel } from "../../../parkingArea/data/dtos/parkingArea.dto";
import { getAverageRatingByParkingArea } from "../../repository/rating.repository";

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

//   RatingSchema.post("save", async function (doc, next) {
//     const parkingArea = await ParkingAreaModel.findById(doc.parkingAreaId);
//     const averageRating = await getAverageRatingByParkingArea(doc.parkingAreaId);
//     if (parkingArea) {
//       parkingArea.rating = doc.rating;
//       await parkingArea.save();
//     }
//   });

  export const RatingModel = model<RatingModel>("Rating", RatingSchema);