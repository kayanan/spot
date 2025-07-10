import { ObjectId, Types } from "mongoose";
import { RatingModel  } from "../data/dtos/ratings.dto";
import { getReservationByIdService } from "@/modules/reservation/service/reservation.service";
import { updateReservation } from "@/modules/reservation/data/repositories/reservation.repository";

export const createRating = async (ratingData: RatingModel) => {
    const {reservationId}=ratingData;
    const reservation=await getReservationByIdService(reservationId.toString()); 
    if(!reservation){
        throw new Error("Reservation not found");
    }
    ratingData.userId=(reservation.user._id) as unknown as ObjectId;
    ratingData.parkingAreaId=reservation.parkingArea._id as unknown as ObjectId;
    const savedRating = await RatingModel.create(ratingData);
    // Update the reservation with the rating reference
    if (savedRating) {
        await updateReservation(reservationId.toString(),{ $set: { rating: savedRating._id } });
    }
    
    return savedRating;
};

export const updateRating = async (id: string, ratingData: Partial<RatingModel>) => {
    const rating = await RatingModel.findByIdAndUpdate(
        id,
        { $set: ratingData },
        { new: true }
    ).populate('userId', 'firstName lastName email')
     .populate('parkingAreaId', 'name addressLine1')
     .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');

    if (!rating) {
        throw new Error("Rating not found");
    }
    return rating;
};

export const deleteRating = async (id: string) => {
    const rating = await RatingModel.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true }
    );
    if (!rating) {
        throw new Error("Rating not found");
    }
    return rating;
};

export const getRatingById = async (id: string) => {
    return await RatingModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .populate('userId', 'firstName lastName email')
        .populate('parkingAreaId', 'name addressLine1')
        .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const getAllRatings = async (options: any = {}) => {
    const { filters = {}, skip = 0, limit = 10, sort = { createdAt: -1 }, count = false } = options;
    
    const query: any = { isDeleted: { $ne: true } };
    
    // Apply filters
    if (filters.parkingAreaId) {
        query.parkingAreaId = new Types.ObjectId(filters.parkingAreaId);
    }
    if (filters.userId) {
        query.userId = new Types.ObjectId(filters.userId);
    }
    if (filters.reservationId) {
        query.reservationId = new Types.ObjectId(filters.reservationId);
    }
    if (filters.rating) {
        query.rating = Number(filters.rating);
    }

    if (count) {
        return await RatingModel.countDocuments(query);
    }

    return await RatingModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate('userId', 'firstName lastName email')
        .populate('parkingAreaId', 'name addressLine1')
        .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const getRatingsByParkingArea = async (parkingAreaId: string, options: any = {}) => {
    const { filters = {}, skip = 0, limit = 10, sort = { createdAt: -1 }, count = false } = options;
    
    const query: any = { 
        parkingAreaId: new Types.ObjectId(parkingAreaId),
        isDeleted: { $ne: true } 
    };
    
    // Apply additional filters
    if (filters.rating) {
        query.rating = Number(filters.rating);
    }

    if (count) {
        return await RatingModel.countDocuments(query);
    }

    return await RatingModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate('userId', 'firstName lastName email')
        .populate('parkingAreaId', 'name addressLine1')
        .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const getRatingsByUser = async (userId: string, options: any = {}) => {
    const { filters = {}, skip = 0, limit = 10, sort = { createdAt: -1 }, count = false } = options;
    
    const query: any = { 
        userId: new Types.ObjectId(userId),
        isDeleted: { $ne: true } 
    };
    
    // Apply additional filters
    if (filters.rating) {
        query.rating = Number(filters.rating);
    }

    if (count) {
        return await RatingModel.countDocuments(query);
    }

    return await RatingModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate('userId', 'firstName lastName email')
        .populate('parkingAreaId', 'name addressLine1')
        .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const getRatingsByReservation = async (reservationId: string) => {
    return await RatingModel.find({ 
        reservationId: new Types.ObjectId(reservationId),
        isDeleted: { $ne: true } 
    })
    .populate('userId', 'firstName lastName email')
    .populate('parkingAreaId', 'name addressLine1')
    .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const getAverageRatingByParkingArea = async (parkingAreaId: string) => {
    const result = await RatingModel.aggregate([
        {
            $match: {
                parkingAreaId: new Types.ObjectId(parkingAreaId),
                isDeleted: { $ne: true }
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 },
                ratingDistribution: {
                    $push: "$rating"
                }
            }
        },
        {
            $project: {
                _id: 0,
                averageRating: { $round: ["$averageRating", 1] },
                totalRatings: 1,
                ratingDistribution: {
                    $reduce: {
                        input: "$ratingDistribution",
                        initialValue: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
                        in: {
                            $mergeObjects: [
                                "$$value",
                                {
                                    $concat: [
                                        { $toString: "$$this" },
                                        ": ",
                                        { $toString: { $add: [{ $indexOfArray: ["$ratingDistribution", "$$this"] }, 1] } }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ]);

    return result[0] || { averageRating: 0, totalRatings: 0, ratingDistribution: {} };
};

export const getRatingsByDateRange = async (startDate: Date, endDate: Date) => {
    return await RatingModel.find({
        createdAt: { $gte: startDate, $lte: endDate },
        isDeleted: { $ne: true }
    })
    .populate('userId', 'firstName lastName email')
    .populate('parkingAreaId', 'name addressLine1')
    .populate('reservationId', 'vehicleNumber startDateAndTime endDateAndTime');
};

export const checkUserHasRated = async (reservationId: string, userId: string) => {
    const rating = await RatingModel.findOne({
        reservationId: new Types.ObjectId(reservationId),
        userId: new Types.ObjectId(userId),
        isDeleted: { $ne: true }
    });
    return !!rating;
}; 