import { ReservationPaymentDTO, ReservationPaymentModel } from "../dtos/reservationPayment.dto";

export const createReservationPayment = async (data: Partial<ReservationPaymentModel>) => {
  return await ReservationPaymentDTO.create(data);
};

export const updateReservationPayment = async (id: string, data: Partial<ReservationPaymentModel>) => {
  return await ReservationPaymentDTO.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReservationPayment = async (id: string) => {
  return await ReservationPaymentDTO.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

export const findReservationPaymentById = async (id: string) => {
    return await ReservationPaymentDTO.findOne({ _id: id, isDeleted: { $ne: true } }).populate("reservation paidBy customer");
  };

export const findAllReservationPayments = async (filters: any,page:number,limit:number) => {
  const skip = (page - 1) * limit;
  const total = await ReservationPaymentDTO.aggregate([
    { $lookup: {
      from: "reservations",
      localField: "reservation",
      foreignField: "_id",
      as: "reservation"
    } },
    { $unwind: "$reservation" },
    { $lookup: {
      from: "parkingarea",
      localField: "reservation.parkingArea",
      foreignField: "_id",
      as: "parkingArea"
    } },
    { $unwind: "$parkingArea" },

    { $match: { isDeleted: { $ne: true },...filters } },
    { $count: "total" }
  ])

  const reservationPayments = await ReservationPaymentDTO.aggregate([
    { $lookup: {
      from: "reservations",
      localField: "reservation",
      foreignField: "_id",
      as: "reservation"
    } },
    { $unwind: "$reservation" },
    { $lookup: {
      from: "parkingareas",
      localField: "reservation.parkingArea",
      foreignField: "_id",
      as: "parkingArea"
    } },
    { $unwind: "$parkingArea" },
   
    { $match: { isDeleted: { $ne: true },...filters } },
    { $sort: { paymentDate: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
  return {
    data: reservationPayments,
    total,  
  };
};

export const findReservationPaymentsByReservation = async (reservationId: string) => {
  return await ReservationPaymentDTO.find({ reservation: reservationId, isDeleted: { $ne: true } }).populate("paidBy customer");
};

export const findReservationPaymentsByCustomer = async (customerId: string) => {
  return await ReservationPaymentDTO.find({ customer: customerId, isDeleted: { $ne: true } }).populate("reservation");
};

export const findReservationPaymentsByParkingArea = async (parkingAreaId: string) => {
  return await ReservationPaymentDTO.find({ parkingArea: parkingAreaId, isDeleted: { $ne: true } }).populate("reservation paidBy customer");
};

export const findReservationPaymentsByParkingSlot = async (parkingSlotId: string) => {
  return await ReservationPaymentDTO.find({ parkingSlot: parkingSlotId, isDeleted: { $ne: true } }).populate("reservation paidBy");
};

export const findReservationPaymentsByPaymentStatus = async (paymentStatus: string) => {
  return await ReservationPaymentDTO.find({ paymentStatus, isDeleted: false }).populate("reservation paidBy customer");
};

export const findReservationPaymentsByPaymentMethod = async (paymentMethod: string) => {
  return await ReservationPaymentDTO.find({ paymentMethod, isDeleted: false }).populate("reservation paidBy customer");
};

export const findReservationPaymentsByDateRange = async (startDate: Date, endDate: Date) => {
  return await ReservationPaymentDTO.find({
    paymentDate: { $gte: startDate, $lte: endDate },
    isDeleted: { $ne: true }
  }).populate("reservation paidBy customer");
};

export const findReservationPaymentsByReferenceNumber = async (referenceNumber: string) => {
  return await ReservationPaymentDTO.findOne({ 
    referenceNumber: referenceNumber, 
    isDeleted: { $ne: true } 
  }).populate("reservation paidBy customer");
};

export const findReservationPaymentsByPaidBy = async (paidById: string) => {
  return await ReservationPaymentDTO.find({ 
    paidBy: paidById, 
    isDeleted: { $ne: true } 
  }).populate("reservation customer");
};

export const findReservationPaymentsByAmountRange = async (minAmount: number, maxAmount: number) => {
  return await ReservationPaymentDTO.find({
    paymentAmount: { $gte: minAmount, $lte: maxAmount },
    isDeleted: { $ne: true }
  }).populate("reservation paidBy customer");
};

export const findSuccessfulPayments = async () => {
  return await ReservationPaymentDTO.find({ 
    paymentStatus: 'paid', 
    isDeleted: { $ne: true } 
  }).populate("reservation paidBy customer");
};

export const findFailedPayments = async () => {
  return await ReservationPaymentDTO.find({ 
    paymentStatus: 'failed', 
    isDeleted: { $ne: true } 
  }).populate("reservation paidBy customer");
};

export const findPendingPayments = async () => {
  return await ReservationPaymentDTO.find({ 
    paymentStatus: 'pending', 
    isDeleted: { $ne: true } 
  }).populate("reservation paidBy customer");
};

export const findRefundedPayments = async () => {
  return await ReservationPaymentDTO.find({ 
    paymentStatus: 'refunded', 
    isDeleted: { $ne: true } 
  }).populate("reservation paidBy customer");
}; 

