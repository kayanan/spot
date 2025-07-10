import { Router } from "express";
import {
  createReservationHandler,
  updateReservationHandler,
  deleteReservationHandler,
  getReservationByIdHandler,
  getAllReservationsHandler,
  getReservationsByUserHandler,
  getReservationsByParkingAreaHandler,
  getReservationsByParkingSlotHandler,
  getActiveReservationsHandler,
  getReservationsByStatusHandler,
  getReservationsByPaymentStatusHandler,
  getReservationByVehicleNumberHandler,
  getReservationsByDateRangeHandler,
  getReservationsByMobileNumberHandler,
  completeReservationHandler,
  cancelReservationHandler,
  updatePaymentStatusHandler
} from "../controller/reservation.controller";
import { ReservationValidator } from "../validators/reservation.validator";

const router = Router();

// Create reservation
router.post(
  "/",
  (req, res, next) => {
    const validation = ReservationValidator.createReservationValidator(req.body);
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
  createReservationHandler as any
);

// Get all reservations (with optional filters)
router.get("/", getAllReservationsHandler as any);

// Get reservation by ID
router.get("/:id", getReservationByIdHandler as any);

// Get reservations by user
router.get("/user/:userId", getReservationsByUserHandler as any);

// Get reservations by parking area
router.get("/parking-area/:parkingAreaId", getReservationsByParkingAreaHandler as any);

// Get reservations by parking slot
router.get("/parking-slot/:parkingSlotId", getReservationsByParkingSlotHandler as any);

// Get active reservations
router.get("/status/active", getActiveReservationsHandler as any);

// Get reservations by status
router.get("/status/:status", getReservationsByStatusHandler as any);

// Get reservations by payment status
router.get("/payment-status/:paymentStatus", getReservationsByPaymentStatusHandler as any);

// Get reservation by vehicle number
router.get("/vehicle/:vehicleNumber", getReservationByVehicleNumberHandler as any);

// Get reservations by date range
router.get("/date-range/:startDate/:endDate", getReservationsByDateRangeHandler as any);

// Get reservations by mobile number
router.get("/mobile/:mobileNumber", getReservationsByMobileNumberHandler as any);

// Update reservation
router.put(
  "/:id",
  (req, res, next) => {
    const validation = ReservationValidator.updateReservationValidator(req.body);
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
  updateReservationHandler as any
);

// Delete reservation
router.delete("/:id", deleteReservationHandler as any);

// Complete reservation
router.patch("/:id/complete", completeReservationHandler as any);

// Cancel reservation
router.patch("/:id/cancel", cancelReservationHandler as any);

// Update payment status
router.patch("/:id/payment-status", updatePaymentStatusHandler as any);

export default router; 