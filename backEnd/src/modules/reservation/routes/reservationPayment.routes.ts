import { Router } from "express";
import {
  createReservationPaymentHandler,
  updateReservationPaymentHandler,
  deleteReservationPaymentHandler,
  getReservationPaymentByIdHandler,
  getAllReservationPaymentsHandler,
  getReservationPaymentsByReservationHandler,
  getReservationPaymentsByCustomerHandler,
  getReservationPaymentsByParkingAreaHandler,
  getReservationPaymentsByParkingSlotHandler,
  getReservationPaymentsByPaymentStatusHandler,
  getReservationPaymentsByPaymentMethodHandler,
  getReservationPaymentsByDateRangeHandler,
  getReservationPaymentByReferenceNumberHandler,
  getReservationPaymentsByPaidByHandler,
  getReservationPaymentsByAmountRangeHandler,
  getSuccessfulPaymentsHandler,
  getFailedPaymentsHandler,
  getPendingPaymentsHandler,
  getRefundedPaymentsHandler
} from "../controller/reservationPayment.controller";
import { ReservationPaymentValidator } from "../validators/reservationPayment.validator";

const router = Router();

// Create reservation payment
router.post(
  "/",
  (req, res, next) => {
    const validation = ReservationPaymentValidator.createReservationPaymentValidator(req.body);
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
  createReservationPaymentHandler as any
);

// Get all reservation payments (with optional filters)
router.get("/", getAllReservationPaymentsHandler as any);

// Get successful payments
router.get("/successful", getSuccessfulPaymentsHandler as any);

// Get failed payments
router.get("/failed", getFailedPaymentsHandler as any);

// Get pending payments
router.get("/pending", getPendingPaymentsHandler as any);

// Get refunded payments
router.get("/refunded", getRefundedPaymentsHandler as any);

// Get reservation payments by date range
router.get("/date-range", getReservationPaymentsByDateRangeHandler as any);

// Get reservation payments by reservation
router.get("/reservation/:reservationId", getReservationPaymentsByReservationHandler as any);

// Get reservation payments by customer
router.get("/customer/:customerId", getReservationPaymentsByCustomerHandler as any);

// Get reservation payments by parking area
router.get("/parking-area/:parkingAreaId", getReservationPaymentsByParkingAreaHandler as any);

// Get reservation payments by parking slot
router.get("/parking-slot/:parkingSlotId", getReservationPaymentsByParkingSlotHandler as any);

// Get reservation payments by payment status
router.get("/payment-status/:paymentStatus", getReservationPaymentsByPaymentStatusHandler as any);

// Get reservation payments by payment method
router.get("/payment-method/:paymentMethod", getReservationPaymentsByPaymentMethodHandler as any);

// Get reservation payment by reference number
router.get("/reference/:referenceNumber", getReservationPaymentByReferenceNumberHandler as any);

// Get reservation payments by paid by
router.get("/paid-by/:paidById", getReservationPaymentsByPaidByHandler as any);

// Get reservation payments by amount range
router.get("/amount-range/:minAmount/:maxAmount", getReservationPaymentsByAmountRangeHandler as any);

// Update reservation payment
router.put(
  "/:id",
  (req, res, next) => {
    const validation = ReservationPaymentValidator.updateReservationPaymentValidator(req.body);
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
  updateReservationPaymentHandler as any
);

// Delete reservation payment
router.delete("/:id", deleteReservationPaymentHandler as any);

// Get reservation payment by ID (must be last to avoid conflicts)
router.get("/:id", getReservationPaymentByIdHandler as any);

export default router; 