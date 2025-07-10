import { Router } from "express";
import {
    createRatingController,
    updateRatingController,
    deleteRatingController,
    getRatingByIdController,
    getAllRatingsController,
    getRatingsByParkingAreaController,
    getRatingsByUserController,
    getRatingsByReservationController,
    getAverageRatingByParkingAreaController,
    checkUserHasRatedController
} from "../controller/rating.controller";
import { validateCreateRating, validateUpdateRating } from "../validators/rating.validator";

const router = Router();

// Create rating
router.post(
    "/add",
    (req, res, next) => {
        console.log(req.body);
        const validation = validateCreateRating(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
            return;
        }
        next();
    },
    createRatingController as any
);

// Get all ratings with pagination and filters
router.get("/", getAllRatingsController as any);

// Get rating by ID
router.get("/:id", getRatingByIdController as any);

// Update rating
router.put(
    "/:id",
    (req, res, next) => {
        const validation = validateUpdateRating(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
            return;
        }
        next();
    },
    updateRatingController as any
);

// Delete rating
router.delete("/:id", deleteRatingController as any);

// Get ratings by parking area
router.get("/parking-area/:parkingAreaId", getRatingsByParkingAreaController as any);

// Get ratings by user
router.get("/user/:userId", getRatingsByUserController as any);

// Get ratings by reservation
        router.get("/reservation/:reservationId", getRatingsByReservationController as any);

// Get average rating by parking area
router.get("/parking-area/:parkingAreaId/average", getAverageRatingByParkingAreaController as any);

// Check if user has rated a parking area
router.get("/check/:parkingAreaId/:userId", checkUserHasRatedController as any);

export default router; 