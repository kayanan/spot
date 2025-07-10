import { PaymentStatus, ReservationModel, ReservationStatus } from "../data/dtos/reservation.dto";
import {
  createReservation,
  updateReservation,
  deleteReservation,
  findReservationById,
  findAllReservations,
  findReservationsByUser,
  findReservationsByParkingArea,
  findReservationsByParkingSlot,
  findActiveReservations,
  findReservationsByStatus,
  findReservationsByPaymentStatus,
  findReservationByVehicleNumber,
  findReservationsByDateRange,
  findReservationsByMobileNumber
} from "../data/repositories/reservation.repository";
import { ReservationValidator } from "../validators/reservation.validator";
import mongoose, { ObjectId, Document } from "mongoose";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { filterParkingSlots, updateSlot } from "../../parkingArea/service/parkingSlot.service";
import { getVehicleByVehicleType } from "../../parkingSubscriptionFee/service/vehicle.service";
import { CreateUpdateParkingSlotRequest } from "@/modules/parkingArea/controller/request/create.parkingSlot.request";
import { VehicleModel } from "@/modules/parkingSubscriptionFee/data/dtos/vehicle.dto";
import { ParkingAreaModel } from "@/modules/parkingArea/data/dtos/parkingArea.dto";
import { ReservationPaymentModel } from "../data/dtos/reservationPayment.dto";


// export const createReservationService1 = async (reservationData: Omit<ReservationModel, "isDeleted">) => {
//   const valResult = ReservationValidator.createReservationValidator(reservationData);
//   if (valResult.error) {
//     throw new Error(valResult.error.message);
//   }
//   const vehicleType = valResult.data.vehicleType;
//   const slotFilterData: { vehicleType: string, startTime: Date, endTime?: Date } = {
//     vehicleType: vehicleType.toLowerCase() as unknown as string,
//     startTime: new Date(valResult.data.startDateAndTime as Date),
//   }
//   if (valResult.data.endDateAndTime) {
//     slotFilterData.endTime = new Date(valResult.data.endDateAndTime as Date);
//   }
//   const parkingArea=valResult.data.parkingArea as string;
//   const parkingSlots = await filterParkingSlots(slotFilterData, [{ _id: new mongoose.Types.ObjectId(parkingArea) }], 9999)
//   if (parkingSlots.length === 0) {
//     throw new Error("No parking slots found");
//   }
//   if (parkingSlots[0].slotCount === 0) {
//     throw new Error("No parking slots available");
//   }

//   return await createReservation();
// };
export const createReservationService = async (reservationData: Partial<ReservationModel>) => {
  const slotFilterData: { vehicleType: string, startTime: Date, endTime?: Date } = {
    vehicleType: reservationData.vehicleType?.toString().toLowerCase() as unknown as string,
    startTime: new Date(reservationData.startDateAndTime as Date),
  }
  if (reservationData.endDateAndTime) {
    slotFilterData.endTime = new Date(reservationData.endDateAndTime as Date);
  }
  const [vehicle, parkingSlots] = await Promise.all([
    getVehicleByVehicleType(reservationData.vehicleType as unknown as string),
    filterParkingSlots(slotFilterData, [{ _id: new mongoose.Types.ObjectId(reservationData.parkingArea as unknown as string) }])
  ])

  if (parkingSlots.length === 0) {
    throw new Error("No parking slots found");
  }
  if (parkingSlots[0].slotCount === 0) {
    throw new Error("No parking slots available");
  }
  const parkingSlotId = parkingSlots[0].slots[0];


  reservationData.parkingSlot = parkingSlotId;
  reservationData.vehicleType = vehicle._id as ObjectId;

  const reservation = await createReservation(reservationData);
  if (reservation) {
    const updateSlotData: any = {
      addReservationId: reservation._id as unknown as string
    }
    if (reservationData.type === "on_spot" && reservationData.isParked) {
      updateSlotData.isOccupied = true;
    }
    await updateSlot(parkingSlotId, updateSlotData);
  }
  return reservation;

};

export const updateReservationService = async (id: string, reservationData: Partial<ReservationModel>) => {
  const valResult = ReservationValidator.updateReservationValidator(reservationData);
  if (valResult.error) {
    throw new Error(valResult.error.message);
  };
  return await updateReservation(id, {$set:reservationData});
};

export const deleteReservationService = async (id: string) => {
  return await deleteReservation(id);
};

export const getReservationByIdService = async (id: string) => {
  return await findReservationById(id);
};

export const getAllReservationsService = async () => {
  return await findAllReservations();
};

export const getReservationsByUserService = async (filters: { userId: string, status: string, paymentStatus: string, startDate: string, endDate: string, searchTerm: string, page: number, limit: number, isParked: boolean }) => {
  const filterData: mongoose.FilterQuery<ReservationModel> = {
    isDeleted: { $ne: true },
  }
  if (filters.isParked) {
    filterData.isParked = filters.isParked;
  }
  if (filters.status) {
    if (filters.status === ReservationStatus.CANCELLED) {
      filterData.$or = [
        { $and: [{ status: ReservationStatus.PENDING }, { createdAt: { $lte: new Date(new Date().getTime() - 1000 * 60 * 5) } }] },
        { status: ReservationStatus.COMPLETED },
      ]
    } else if (filters.status === ReservationStatus.PENDING) {
      filterData.status = ReservationStatus.PENDING as unknown as string;
      filterData.createdAt = { $gte: new Date(new Date().getTime() - 1000 * 60 * 5) };
    }
    else {
      filterData.status = filters.status.toLowerCase() as unknown as string;
    }

  }
  if (filters.paymentStatus) {
    filterData.paymentStatus = filters.paymentStatus.toLowerCase() as unknown as string;
  }
  if (filters.startDate) {
    filterData.startDateAndTime = { $gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    filterData.endDateAndTime = { $lte: new Date(filters.endDate) };
  }
  if (filters.searchTerm) {
    filterData.$or = [
      { vehicleNumber: { $regex: filters.searchTerm.replace(/\s+/g, ''), $options: 'i' } },
    ]
  }
  return await findReservationsByUser(filterData, filters.page, filters.limit);
};

export const getReservationsByParkingAreaService = async (parkingAreaId: string) => {
  return await findReservationsByParkingArea(parkingAreaId);
};

export const getReservationsByParkingSlotService = async (parkingSlotId: string) => {
  return await findReservationsByParkingSlot(parkingSlotId);
};

export const getActiveReservationsService = async (filters: mongoose.FilterQuery<ReservationModel & {page:number,limit:number,userId:string}>) => {
  const filterData: mongoose.FilterQuery<ReservationModel> = {
    user: filters.userId,
    isDeleted: { $ne: true },
    status: { $in: [ReservationStatus.CONFIRMED,ReservationStatus.COMPLETED] },
    paymentStatus: { $eq: PaymentStatus.PENDING },
    $or:[
      {$and:[
        {isParked: { $eq: false }},
        { startDateAndTime: { $gte: new Date(new Date().getTime() - 1 * 60 * 60 * 1000) }},
        { startDateAndTime: { $lte: new Date() }},

      ]},
      {$and:[
        {isParked: { $eq: true }},

      ]}
    ],
   
   

  }
  return await findActiveReservations(filterData,filters.page,filters.limit);
};

export const getReservationsByStatusService = async (status: string) => {
  return await findReservationsByStatus(status);
};

export const getReservationsByPaymentStatusService = async (paymentStatus: string) => {
  return await findReservationsByPaymentStatus(paymentStatus);
};

export const getReservationByVehicleNumberService = async (vehicleNumber: string) => {
  return await findReservationByVehicleNumber(vehicleNumber);
};

export const getReservationsByDateRangeService = async (startDate: Date, endDate: Date) => {
  return await findReservationsByDateRange(startDate, endDate);
};

export const getReservationsByMobileNumberService = async (mobileNumber: string) => {
  return await findReservationsByMobileNumber(mobileNumber);
};

export const calculateFinalAmountService = async (id: string) => {
  const reservation: ReservationModel & { paymentIds: ReservationPaymentModel[] } | null = await findReservationById(id);
  if (!reservation) {
    throw new Error("Reservation not found");
  }
  const totalPaidAmount = reservation.paymentIds.reduce((acc, payments: ReservationPaymentModel) => {
    if (payments?.paymentStatus === PaymentStatus.PAID) {
      return acc + payments?.paymentAmount
    }
    return acc
  }, 0)

  dayjs.extend(duration);
  const endTime: Date = new Date();
  const startTime: Date = new Date(reservation.startDateAndTime);
  const diff = dayjs.duration(endTime.getTime() - startTime.getTime());
  const hoursDiff = Math.ceil(diff.asMinutes() / 60);
  const totalAmount = Math.ceil(hoursDiff) * (reservation.perHourRate || 0)

  return {
    totalPaidAmount,
    totalAmount
  }

}

export const completeReservationService = async (id: string) => {
  const reservation = await findReservationById(id);
  if (!reservation) {
    throw new Error("Reservation not found");
  }
  console.log(reservation, "reservation.paymentIds");
  const paidTotalAmount = reservation.paymentIds.reduce((acc, payments: ReservationPaymentModel) => {
    console.log(payments, "payments");
    if (payments?.paymentStatus === PaymentStatus.PAID) {
      console.log(payments?.paymentAmount, "payments?.paymentAmount");
      return acc + payments?.paymentAmount
    }
    return acc
  }, 0)
  dayjs.extend(duration);
  const endTime: Date = new Date();
  const startTime: Date = new Date(reservation.startDateAndTime);
  const diff = dayjs.duration(endTime.getTime() - startTime.getTime());
  const hoursDiff = Math.ceil(diff.asMinutes() / 60);
  const calculatedTotalAmount = Math.ceil(hoursDiff) * (reservation.perHourRate || 0)
  console.log(paidTotalAmount, calculatedTotalAmount, "paidTotalAmount, calculatedTotalAmount");
  if ((+paidTotalAmount) !== (+calculatedTotalAmount)) {
    throw new Error("Payment amount is not equal to the calculated total amount");
  }

  await updateSlot(reservation.parkingSlot as unknown as string, { removeReservationId: reservation._id as unknown as string });

  return await updateReservation(id, {$set:{
    endDateAndTime: new Date(),
    totalAmount: paidTotalAmount,
    status: ReservationStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
  } } as Partial<mongoose.UpdateQuery<ReservationModel>>);

};

export const cancelReservationService = async (id: string) => {
  const reservation = await findReservationById(id);
  if (!reservation) {
    throw new Error("Reservation not found");
  }
  await updateSlot(reservation.parkingSlot as unknown as string, { removeReservationId: reservation._id as unknown as string });
  return await updateReservation(id, {$set:{ status: 'cancelled' } } as Partial<mongoose.UpdateQuery<ReservationModel>>);
};

export const updatePaymentStatusService = async (id: string, paymentStatus: string) => {
  return await updateReservation(id, {$set:{ paymentStatus } } as Partial<mongoose.UpdateQuery<ReservationModel>>);
};


export const changeSlotService = async (reservationId: string) => {
  const reservation: ReservationModel | null = await findReservationById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");

  }
  const vehicleType = reservation.vehicleType as VehicleModel;
  const slotFilterData: { vehicleType: string, startTime: Date, endTime?: Date } = {
    vehicleType: vehicleType.vehicleType.toLowerCase() as unknown as string,
    startTime: new Date(reservation.startDateAndTime as Date),
  }
  if (reservation.endDateAndTime) {
    slotFilterData.endTime = new Date(reservation.endDateAndTime as Date);
  }
  const parkingArea = reservation.parkingArea as ParkingAreaModel;


  const parkingSlots = await filterParkingSlots(slotFilterData, [{ _id: parkingArea._id as unknown as string }], 9999)

  if (parkingSlots.length === 0) {
    throw new Error("No parking slots found");
  }
  if (parkingSlots[0].slotCount === 0) {
    throw new Error("No parking slots available");
  }
  const parkingSlotId = parkingSlots[0].slots[parkingSlots[0].slots.length - 1];
  const [slotRes, slotRes2, reservationRes] = await Promise.all([
    updateSlot(reservation.parkingSlot as unknown as string, { removeReservationId: reservationId }),
    updateSlot(parkingSlotId, { addReservationId: reservationId, isOccupied: true }),
    updateReservation(reservationId, {$set:{ parkingSlot: parkingSlotId } } as Partial<mongoose.UpdateQuery<ReservationModel>>)
  ])
  return reservationRes;
};