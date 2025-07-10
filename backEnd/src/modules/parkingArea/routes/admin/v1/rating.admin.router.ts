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

// Admin can create ratings (for testing or manual entry)
router.post("/add", createRatingController as RequestHandler);

// Get all ratings with pagination and filters (admin view)
router.get("/", getAllRatingsController as RequestHandler);

// Get rating by ID
router.get("/:id", getRatingByIdController as RequestHandler);

// Update rating (admin can update any rating)
router.put("/:id", updateRatingController as RequestHandler);

// Delete rating (admin can delete any rating)
router.delete("/:id", deleteRatingController as RequestHandler);

// Get ratings by parking area (admin view)
router.get("/parking-area/:parkingAreaId", getRatingsByParkingAreaController as RequestHandler);

// Get ratings by user (admin view)
router.get("/user/:userId", getRatingsByUserController as RequestHandler);

// Get ratings by reservation (admin view)
router.get("/reservation/:reservationId", getRatingsByReservationController as RequestHandler);

// Get average rating by parking area (admin view)
router.get("/parking-area/:parkingAreaId/average", getAverageRatingByParkingAreaController as RequestHandler);

// Check if user has rated a parking area
router.get("/check/:parkingAreaId/:userId", checkUserHasRatedController as RequestHandler);

export default router; 