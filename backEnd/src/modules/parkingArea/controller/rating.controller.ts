import { Request, Response } from "express";
import {
    createRatingService,
    updateRatingService,
    deleteRatingService,
    getRatingByIdService,
    getAllRatingsService,
    getRatingsByParkingAreaService,
    getRatingsByUserService,
    getRatingsByReservationService,
    getAverageRatingByParkingAreaService,
    checkUserHasRatedService
} from "../service/rating.service";

export const createRatingController = async (req: Request, res: Response) => {
    try {
        const ratingData = req.body;
        const rating = await createRatingService(ratingData);
        res.status(201).json({
            success: true,
            message: "Rating created successfully",
            data: rating,
        });
    } catch (error) {
        console.log(error,"error=++++++++==+++++==+++++==+++++++");
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateRatingController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ratingData = req.body;
        const rating = await updateRatingService(id, ratingData);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            data: rating,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteRatingController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await deleteRatingService(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Rating not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Rating deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getRatingByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await getRatingByIdService(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Rating not found",
            });
        }
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllRatingsController = async (req: Request, res: Response) => {
    try {
        const result = await getAllRatingsService();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getRatingsByParkingAreaController = async (req: Request, res: Response) => {
    try {
        const { parkingAreaId } = req.params;
        const result = await getRatingsByParkingAreaService(parkingAreaId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getRatingsByUserController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await getRatingsByUserService(userId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getRatingsByReservationController = async (req: Request, res: Response) => {
    try {
        const { reservationId } = req.params;
        const result = await getRatingsByReservationService(reservationId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAverageRatingByParkingAreaController = async (req: Request, res: Response) => {
    try {
        const { parkingAreaId } = req.params;
        const result = await getAverageRatingByParkingAreaService(parkingAreaId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const checkUserHasRatedController = async (req: Request, res: Response) => {
    try {
        const { parkingAreaId, userId } = req.params;
        const result = await checkUserHasRatedService(parkingAreaId, userId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}; 