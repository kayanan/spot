import { RequestHandler, Router } from "express";
import {
  createReservationPaymentHandler,
  updateReservationPaymentHandler,
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
  getRefundedPaymentsHandler,
  notifyPaymentController,
  generateHashController
} from "../../../controller/reservationPayment.controller";

const router = Router();

// Create a new reservation payment
router.post("/", createReservationPaymentHandler as unknown as RequestHandler);

// Get all reservation payments
router.get("/", getAllReservationPaymentsHandler as RequestHandler);

// Get successful payments
router.get("/successful", getSuccessfulPaymentsHandler as RequestHandler);

// Get failed payments
router.get("/failed", getFailedPaymentsHandler as RequestHandler);

// Get pending payments
router.get("/pending", getPendingPaymentsHandler as RequestHandler);

// Get refunded payments
router.get("/refunded", getRefundedPaymentsHandler as RequestHandler);

// Get reservation payments by date range
router.get("/date-range", getReservationPaymentsByDateRangeHandler as RequestHandler);

// Get reservation payments by reservation
router.get("/reservation/:reservationId", getReservationPaymentsByReservationHandler as RequestHandler);

// Get reservation payments by customer
router.get("/customer/:customerId", getReservationPaymentsByCustomerHandler as RequestHandler);

// Get reservation payments by parking area
router.get("/parking-area/:parkingAreaId", getReservationPaymentsByParkingAreaHandler as RequestHandler);

// Get reservation payments by parking slot
router.get("/parking-slot/:parkingSlotId", getReservationPaymentsByParkingSlotHandler as RequestHandler);

// Get reservation payments by payment status
router.get("/payment-status/:paymentStatus", getReservationPaymentsByPaymentStatusHandler as RequestHandler);

// Get reservation payments by payment method
router.get("/payment-method/:paymentMethod", getReservationPaymentsByPaymentMethodHandler as RequestHandler);

// Get reservation payment by reference number
router.get("/reference/:referenceNumber", getReservationPaymentByReferenceNumberHandler as RequestHandler);

// Get reservation payments by paid by
router.get("/paid-by/:paidById", getReservationPaymentsByPaidByHandler as RequestHandler);

// Get reservation payments by amount range
router.get("/amount-range/:minAmount/:maxAmount", getReservationPaymentsByAmountRangeHandler as RequestHandler);

// Update reservation payment
router.patch("/:id", updateReservationPaymentHandler as RequestHandler);

// Get reservation payment by ID (must be last to avoid conflicts)
router.get("/:id", getReservationPaymentByIdHandler as RequestHandler);

// Generate hash
router.post("/generate-hash", generateHashController as RequestHandler);

// Notify payment
router.post("/notify", notifyPaymentController as RequestHandler);

export default router; 