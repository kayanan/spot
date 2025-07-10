import { RequestHandler, Router } from "express";
import {
  createReservationHandler,
  updateReservationHandler,
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
  updatePaymentStatusHandler,
  createPreBookingReservationHandler,
  changeSlotHandler,
  calculateFinalAmountHandler,
} from "../../../controller/reservation.controller";

const router = Router();

// Create a new reservation
router.post("/", createReservationHandler as RequestHandler);

// Get all reservations
router.get("/", getAllReservationsHandler as RequestHandler);

// Get active reservations
router.get("/active", getActiveReservationsHandler as RequestHandler);

// Get reservations by date range
router.get("/date-range", getReservationsByDateRangeHandler as RequestHandler);

// Get reservations by user
router.get("/user/:userId", getReservationsByUserHandler as RequestHandler);

// Get reservations by parking area
router.get("/parking-area/:parkingAreaId", getReservationsByParkingAreaHandler as RequestHandler);

// Get reservations by parking slot
router.get("/parking-slot/:parkingSlotId", getReservationsByParkingSlotHandler as RequestHandler);

// Get reservations by status
router.get("/status/:status", getReservationsByStatusHandler as RequestHandler);

// Get reservations by payment status
router.get("/payment-status/:paymentStatus", getReservationsByPaymentStatusHandler as RequestHandler);

// Get reservation by vehicle number
router.get("/vehicle/:vehicleNumber", getReservationByVehicleNumberHandler as RequestHandler);

// Get reservations by mobile number
router.get("/mobile/:mobileNumber", getReservationsByMobileNumberHandler as RequestHandler);

// Update payment status
router.patch("/:id/payment-status", updatePaymentStatusHandler as RequestHandler);

// Complete reservation
router.patch("/:id/complete", completeReservationHandler as RequestHandler);

// Cancel reservation
router.patch("/:id/cancel", cancelReservationHandler as RequestHandler);

// Update reservation
router.patch("/:id", updateReservationHandler as RequestHandler);

// Get reservation by ID (must be last to avoid conflicts)
router.get("/:id", getReservationByIdHandler as RequestHandler);

// Create pre-booking reservation
router.post("/pre-booking", createPreBookingReservationHandler as RequestHandler);

// Change slot
router.patch("/:id/change-slot", changeSlotHandler as RequestHandler);


// Calculate final amount
router.get("/:id/calculate-final-amount", calculateFinalAmountHandler as RequestHandler);
export default router; 