import { RequestHandler, Router } from "express";
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
} from "../../../controller/rating.controller";

const router = Router();

// Create rating (for users to rate parking areas)
router.post("/add", createRatingController as RequestHandler);

// Get rating by ID
router.get("/:id", getRatingByIdController as RequestHandler);

// Get all ratings with pagination and filters
router.get("/", getAllRatingsController as RequestHandler);

// Update rating (users can update their own ratings)
router.put("/:id", updateRatingController as RequestHandler);

// Delete rating (users can delete their own ratings)
router.delete("/:id", deleteRatingController as RequestHandler);

// Get ratings by parking area
router.get("/parking-area/:parkingAreaId", getRatingsByParkingAreaController as RequestHandler);

// Get ratings by user
router.get("/user/:userId", getRatingsByUserController as RequestHandler);

// Get ratings by reservation
router.get("/reservation/:reservationId", getRatingsByReservationController as RequestHandler);

// Get average rating by parking area
router.get("/parking-area/:parkingAreaId/average", getAverageRatingByParkingAreaController as RequestHandler);

// Check if user has rated a parking area
router.get("/check/:parkingAreaId/:userId", checkUserHasRatedController as RequestHandler);

export default router; 