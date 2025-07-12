import { ReservationPaymentModel } from "../data/dtos/reservationPayment.dto";
import {
  createReservationPayment,
  updateReservationPayment,
  deleteReservationPayment,
  findReservationPaymentById,
  findAllReservationPayments,
  findReservationPaymentsByReservation,
  findReservationPaymentsByCustomer,
  findReservationPaymentsByParkingArea,
  findReservationPaymentsByParkingSlot,
  findReservationPaymentsByPaymentStatus,
  findReservationPaymentsByPaymentMethod,
  findReservationPaymentsByDateRange,
  findReservationPaymentsByReferenceNumber,
  findReservationPaymentsByPaidBy,
  findReservationPaymentsByAmountRange,
  findSuccessfulPayments,
  findFailedPayments,
  findPendingPayments,
  findRefundedPayments
} from "../data/repositories/reservationPayment.repository";
import { ReservationPaymentValidator } from "../validators/reservationPayment.validator";
import crypto from "crypto";
import { PaymentMethod, PaymentStatus } from "../data/dtos/reservationPayment.dto";
import { updateReservation } from "../data/repositories/reservation.repository";
import { ReservationStatus } from "../data/dtos/reservation.dto";
import { updateSlot } from "@/modules/parkingArea/repository/parkingSlot.repository";
import { getReservationByIdService } from "./reservation.service";
import { ParkingSlotModel } from "@/modules/parkingArea/data/dtos/parkingSlot.dto";
import { CreateUpdateParkingSlotRequest } from "@/modules/parkingArea/controller/request/create.parkingSlot.request";
import { FilterQuery } from "mongoose";
import mongoose from "mongoose";

export const createReservationPaymentService = async (data: Omit<ReservationPaymentModel, "isDeleted">) => {
  try {
    const value = ReservationPaymentValidator.createReservationPaymentValidator(data);
    if (!value.success) {
      throw new Error(value.error.message);
    }

    const reservationPayment = await createReservationPayment(data);
    await updateReservation(data.reservation.toString(), { $push: { paymentIds: reservationPayment._id } });
    return reservationPayment;
  } catch (error) {
    throw new Error(`Failed to create reservation payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateReservationPaymentService = async (id: string, data: Partial<ReservationPaymentModel>) => {
  try {
    const reservationPayment = await updateReservationPayment(id, data);
    if (!reservationPayment) {
      throw new Error("Reservation payment not found");
    }
    return reservationPayment;
  } catch (error) {
    throw new Error(`Failed to update reservation payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteReservationPaymentService = async (id: string) => {
  try {
    const reservationPayment = await deleteReservationPayment(id);
    if (!reservationPayment) {
      throw new Error("Reservation payment not found");
    }
    return reservationPayment;
  } catch (error) {
    throw new Error(`Failed to delete reservation payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentByIdService = async (id: string) => {
  try {
    const reservationPayment = await findReservationPaymentById(id);
    return reservationPayment;
  } catch (error) {
    throw new Error(`Failed to get reservation payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllReservationPaymentsService = async (query: any) => {
  try {
    const { page = 1, limit = 9999 ,startDate, endDate, parkingArea, paymentStatus, paymentMethod, customer, paidBy, minAmount, maxAmount,reservation,paymentType,parkingOwner} = query;
    const filters:FilterQuery<ReservationPaymentModel> = {};

    if(startDate){
      filters.paymentDate = { $gte: new Date(startDate) };
    }
    if(endDate){
      filters.paymentDate = { $lte: new Date(endDate) };
    }
    if(paymentStatus){
      filters.paymentStatus = paymentStatus;
    }
    if(paymentMethod){
      filters.paymentMethod = paymentMethod;
    }
    if(customer){
      filters.customer = customer;
    }
    if(paidBy){
      filters.paidBy = paidBy;
    }
    if(minAmount){
      filters.paymentAmount = { $gte: minAmount };
    }
    if(maxAmount){
      filters.paymentAmount = { $lte: maxAmount };
    }
    if(reservation){
      filters.reservation = reservation;
    }
    if(paymentType){
      filters.paymentType = paymentType;
    }
    if(parkingOwner){
      filters["parkingArea.ownerId"] = new mongoose.Types.ObjectId(parkingOwner);
    }
    if(parkingArea){
      filters["parkingArea._id"] = new mongoose.Types.ObjectId(parkingArea);
    }
    console.log(filters,"filters");
    const reservationPayments = await findAllReservationPayments(filters,page,limit);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get all reservation payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByReservationService = async (reservationId: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByReservation(reservationId);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByCustomerService = async (customerId: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByCustomer(customerId);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByParkingAreaService = async (parkingAreaId: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByParkingArea(parkingAreaId);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by parking area: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByParkingSlotService = async (parkingSlotId: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByParkingSlot(parkingSlotId);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by parking slot: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByPaymentStatusService = async (paymentStatus: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByPaymentStatus(paymentStatus);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByPaymentMethodService = async (paymentMethod: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByPaymentMethod(paymentMethod);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByDateRangeService = async (startDate: Date, endDate: Date) => {
  try {
    const reservationPayments = await findReservationPaymentsByDateRange(startDate, endDate);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentByReferenceNumberService = async (referenceNumber: string) => {
  try {
    const reservationPayment = await findReservationPaymentsByReferenceNumber(referenceNumber);
    return reservationPayment;
  } catch (error) {
    throw new Error(`Failed to get reservation payment by reference number: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByPaidByService = async (paidById: string) => {
  try {
    const reservationPayments = await findReservationPaymentsByPaidBy(paidById);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by paid by: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getReservationPaymentsByAmountRangeService = async (minAmount: number, maxAmount: number) => {
  try {
    const reservationPayments = await findReservationPaymentsByAmountRange(minAmount, maxAmount);
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get reservation payments by amount range: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getSuccessfulPaymentsService = async () => {
  try {
    const reservationPayments = await findSuccessfulPayments();
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get successful payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getFailedPaymentsService = async () => {
  try {
    const reservationPayments = await findFailedPayments();
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get failed payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getPendingPaymentsService = async () => {
  try {
    const reservationPayments = await findPendingPayments();
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get pending payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getRefundedPaymentsService = async () => {
  try {
    const reservationPayments = await findRefundedPayments();
    return reservationPayments;
  } catch (error) {
    throw new Error(`Failed to get refunded payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateHashService = async (body: any) => {
  const { order_id, amount, currency } = body;
  const hashedMerchantSecret = crypto.createHash("md5").update(process.env.MERCHANT_SECRET!)
    .digest("hex").toString().toUpperCase();

  const hash = crypto.createHash("md5")
    .update(process.env.MERCHANT_ID!.toString() + order_id + amount + currency + hashedMerchantSecret)
    .digest("hex").toUpperCase();
  return { hash, merchant_id: process.env.MERCHANT_ID };
};

export const notifyPaymentService = async (body: any) => {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

  const local_md5sig = crypto
    .createHash("md5")
    .update(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      crypto
        .createHash("md5")
        .update(process.env.MERCHANT_SECRET!.toString())
        .digest("hex")
        .toUpperCase()
    )
    .digest("hex")
    .toUpperCase();
  if (local_md5sig === md5sig && status_code == "2") {
    const reservationPayment = {
      paymentAmount: body?.payhere_amount || 0,
      paymentStatus: PaymentStatus.PAID,
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.CARD,
      referenceNumber: body?.payment_id || "",
      cardPaymentDetails: {
        cardNumber: body?.card_no || "",
        cardHolderName: body?.card_holder_name || "",
        cardExpiryMonth: body?.card_exp?.split("/")[0] || "",
        cardExpiryYear: body?.card_exp?.split("/")[1] || "",
      },
      paidBy: body?.custom_1 || "",
      customer: body?.custom_1 || "",
      reservation: body?.order_id || "",
    }
    const newReservationPayment = await createReservationPayment(reservationPayment);

    // want to implement  in redis if falback to database
    try {
      await updateReservation(body?.order_id,
        {
          $set: { status: ReservationStatus.CONFIRMED },
          $push: { paymentIds: newReservationPayment._id }
        })
      return { success: true, message: "Payment successful" };

    } catch (error) {
      console.log(error);
      return { success: false, message: "Payment verification failed" };
    }

  }
  else {
    const reservationPayment = {
      paymentAmount: body?.payhere_amount || 0,
      paymentStatus: PaymentStatus.FAILED,
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.CARD,
      referenceNumber: body?.payment_id || "",
      cardPaymentDetails: {
        cardNumber: body?.card_no || "",
        cardHolderName: body?.card_holder_name || "",
        cardExpiryMonth: body?.card_exp?.split("/")[0] || "",
        cardExpiryYear: body?.card_exp?.split("/")[1] || "",
      },
      paidBy: body?.custom_1 || "",
      customer: body?.custom_1 || "",
      reservation: body?.order_id || "",
    }
    const newReservationPayment = await createReservationPayment(reservationPayment);
    try {
      await updateReservation(body?.order_id, { $set: { paymentStatus: PaymentStatus.FAILED }, $push: { paymentIds: newReservationPayment._id } })
      return { success: false, message: "Payment verification failed" };
    } catch (error) {
      console.log(error);
      return { success: false, message: "Payment verification failed and database update failed" };
    }
  }
};


