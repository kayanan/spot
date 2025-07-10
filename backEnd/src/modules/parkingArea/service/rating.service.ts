import {
    createRating as createRatingRepo,
    updateRating as updateRatingRepo,
    deleteRating as deleteRatingRepo,
    getRatingById as getRatingByIdRepo,
    getAllRatings as getAllRatingsRepo,
    getRatingsByParkingArea as getRatingsByParkingAreaRepo,
    getRatingsByUser as getRatingsByUserRepo,
    getRatingsByReservation as getRatingsByReservationRepo,
    getAverageRatingByParkingArea as getAverageRatingByParkingAreaRepo,
    getRatingsByDateRange as getRatingsByDateRangeRepo,
    checkUserHasRated as checkUserHasRatedRepo
} from "../repository/rating.repository";
import { validateCreateRating, validateUpdateRating } from "../validators/rating.validator";
import { RatingModel } from "../data/dtos/ratings.dto";
export const createRatingService = async (ratingData: Partial<RatingModel>) => {
    const valResult = validateCreateRating(ratingData);
    if (valResult.error) {
        throw new Error(valResult.error.message);
    }
    
    // Check if user has already rated this reservation
    const existingRating = await checkUserHasRatedRepo(
        ratingData.reservationId?.toString() as unknown as string , 
        ratingData.userId?.toString() as unknown as string
    );
    if (existingRating) {
        throw new Error('User has already rated this reservation');
    }

    return await createRatingRepo(ratingData as RatingModel);
};

export const updateRatingService = async (id: string, ratingData: Partial<RatingModel>) => {
    const valResult = validateUpdateRating(ratingData);
    if (valResult.error) {
        throw new Error(valResult.error.message);
    }

    const existingRating = await getRatingByIdRepo(id);
    if (!existingRating) {
        throw new Error('Rating not found');
    }

    return await updateRatingRepo(id, ratingData as Partial<RatingModel>);
};

export const deleteRatingService = async (id: string) => {
    const existingRating = await getRatingByIdRepo(id);
    if (!existingRating) {
        throw new Error('Rating not found');
    }

    return await deleteRatingRepo(id);
};

export const getRatingByIdService = async (id: string) => {
    return await getRatingByIdRepo(id);
};

export const getAllRatingsService = async () => {
    return await getAllRatingsRepo({});
};

export const getRatingsByParkingAreaService = async (parkingAreaId: string) => {
    return await getRatingsByParkingAreaRepo(parkingAreaId, {});
};

export const getRatingsByUserService = async (userId: string) => {
    return await getRatingsByUserRepo(userId, {});
};

export const getRatingsByReservationService = async (reservationId: string) => {
    return await getRatingsByReservationRepo(reservationId);
};

export const getAverageRatingByParkingAreaService = async (parkingAreaId: string) => {
    const result = await getAverageRatingByParkingAreaRepo(parkingAreaId);
    return {
        parkingAreaId,
        averageRating: result.averageRating || 0,
        totalRatings: result.totalRatings || 0,
        ratingDistribution: result.ratingDistribution || {}
    };
};

export const getRatingsByDateRangeService = async (startDate: Date, endDate: Date) => {
    return await getRatingsByDateRangeRepo(startDate, endDate);
};

export const checkUserHasRatedService = async (parkingAreaId: string, userId: string) => {
    return await checkUserHasRatedRepo(parkingAreaId, userId);
}; 
