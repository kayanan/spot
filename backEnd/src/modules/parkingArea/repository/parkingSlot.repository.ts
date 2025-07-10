import { ReservationStatus } from "@/modules/reservation/data/dtos/reservation.dto";
import { CreateUpdateParkingSlotRequest } from "../controller/request/create.parkingSlot.request";
import { ParkingSlotDTO } from "../data/dtos/parkingSlot.dto";


export const createSlot = async (slotData: Partial<CreateUpdateParkingSlotRequest>[]) => {
  const slots = Array.isArray(slotData) ? slotData : [slotData];
  const result = await ParkingSlotDTO.insertMany(slots, { rawResult: true });
  return result;
};

export const updateSlot = async (id: string, slotData: Partial<CreateUpdateParkingSlotRequest>) => {
  const data: any = { $set: slotData };
  if (slotData.addReservationId) {
    data.$push = { reservationIds: slotData.addReservationId };
    delete data.$set.addReservationId;
  }
  if (slotData.removeReservationId) {
    data.$pull = { reservationIds: slotData.removeReservationId };
    delete data.$set.removeReservationId;
  }
  console.log(data, "data---------------------------------------------------------------------------------------");
  const slot = await ParkingSlotDTO.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );
  console.log(slot, "slot---------------------------------------------------------------------------------------");
  if (!slot) {
    throw new Error("Slot not found");
  }
  return slot;
};

export const updateSlotByParkingAreaId = async (parkingAreaId: string, slotData: CreateUpdateParkingSlotRequest & { vehicleId: string }) => {

  const slot = await ParkingSlotDTO.updateMany({ parkingAreaId, vehicleType: slotData?.vehicleId }, { $set: { slotPrice: slotData?.slotPrice } });
  return slot;
};

export const deleteSlot = async (id: string) => {
  const slot = await ParkingSlotDTO.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!slot) {
    throw new Error("Slot not found");
  }
  return slot;
};

export const getSlotById = async (id: string) => {
  return await ParkingSlotDTO.findOne({ _id: id, isDeleted: false });
};

export const getAllSlots = async () => {
  return await ParkingSlotDTO.find({ isDeleted: false });
};

export const getActiveSlots = async () => {
  return await ParkingSlotDTO.find({ isActive: true, isDeleted: false });
};

export const getSlotsByParkingArea = async (id: string) => {
  const slots = await ParkingSlotDTO.find({
    parkingAreaId: id,
    isDeleted: { $ne: true }
  }).populate('vehicleType reservationIds').lean();
  return slots;
};

export const getSlotByNumberAndArea = async (parkingAreaId: string, slotNumber: number) => {
  return await ParkingSlotDTO.findOne({
    parkingAreaId,
    slotNumber,
    isDeleted: false
  });
};

export const deleteManySlots = async (parkingAreaId: string) => {
  return await ParkingSlotDTO.deleteMany({
    parkingAreaId: parkingAreaId,
    isDeleted: true
  });
};

export const updateParkingSlotStatus = async (parkingAreaId: string[], status: boolean) => {
  return await ParkingSlotDTO.updateMany({
    parkingAreaId: { $in: parkingAreaId },
    isDeleted: false
  }, { $set: { isActive: status } });
};

export const filterParkingSlots = async (filter: any, parkingAreaIds: any[], filteredSlotsCount: number = 10) => {
  const extraCondition = filter?.endTime
    ? [{ $lte: ["$$reservation.startDateAndTime", new Date(filter.endTime + 1000 * 60 * 60 * 2)] }]
    : [];

  const parkingSlots = await ParkingSlotDTO.aggregate([
    {
      $match: {
        parkingAreaId: { $in: parkingAreaIds },
        isActive: true,
        isDeleted: { $ne: true }
      }
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleType',
        foreignField: '_id',
        as: 'vehicle'
      },
    },
    {
      $unwind: '$vehicle'
    },
    {
      $match: {
        'vehicle.vehicleType': filter.vehicleType,
        'vehicle.isDeleted': { $ne: true }
      }
    },
    {
      $addFields: {
        reservationIds: { $ifNull: ['$reservationIds', []] }
      }
    },
    {
      $lookup: {
        from: 'reservations',
        let: { reservationId: '$reservationIds' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$reservationId'] }
            }
          }
        ],
        as: 'reservations'
      }
    },
    {
      $addFields: {
        rejectedreservations: {
          $filter: {
            input: '$reservations',
            as: 'reservation',
            cond: {
              $or: [
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.CONFIRMED] },
                    { $eq: ["$$reservation.isParked", true] },
                    { $eq: ["$$reservation.endDateAndTime", null] },
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.CONFIRMED] },
                    { $eq: ["$$reservation.isParked", true] },
                    { $lte: ["$$reservation.endDateAndTime", new Date()] },
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.CONFIRMED] },
                    { $eq: ["$$reservation.isParked", false] },
                    { $gte: ["$$reservation.startDateAndTime", new Date(new Date().getTime() - 1000 * 60 * 60 * 1)] },
                    { $eq: ["$$reservation.endDateAndTime", null] },
                    ...extraCondition
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.CONFIRMED] },
                    { $eq: ["$$reservation.isParked", false] },
                    { $gte: ["$$reservation.startDateAndTime", new Date(new Date().getTime() - 1000 * 60 * 60 * 1)] },
                    ...extraCondition
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.CONFIRMED] },
                    { $eq: ["$$reservation.isParked", false] },
                    { $gte: ["$$reservation.startDateAndTime", new Date(new Date().getTime() - 1000 * 60 * 60 * 1)] },
                    { $gte: ["$$reservation.endDateAndTime", new Date(filter.startTime - 1000 * 60 * 60 * 2)] },
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.PENDING] },
                    { $eq: ["$$reservation.isParked", false] },
                    { $gte: ["$$reservation.createdAt", new Date(new Date().getTime() - 1000 * 60 * 5)] },
                    { $eq: ["$$reservation.endDateAndTime", null] },
                    ...extraCondition
                  ]
                },
                {
                  $and: [
                    { $eq: ["$$reservation.status", ReservationStatus.PENDING] },
                    { $eq: ["$$reservation.isParked", false] },
                    { $gte: ["$$reservation.createdAt", new Date(new Date().getTime() - 1000 * 60 * 5)] },
                    { $gte: ["$$reservation.endDateAndTime", new Date(filter.startTime - 1000 * 60 * 60 * 2)] },
                  ]
                },
              ]


            }
          }
        },

      }
    },
    {
      $match: {
        $or: [
          { $expr: { $eq: [{ $size: "$reservations" }, 0] } },
          {
            $and: [
              { $expr: { $ne: [{ $size: "$reservations" }, 0] } },
              { $expr: { $eq: [{ $size: "$rejectedreservations" }, 0] } },

            ]
          },


        ]
      }
    },

    {
      $group: {
        _id: '$parkingAreaId',
        slotCount: { $sum: 1 },
        slots: { $push: '$_id' },
        price: { $first: '$slotPrice' }
      }
    },
    {
      $lookup: {
        from: 'parkingareas',
        localField: '_id',
        foreignField: '_id',
        as: 'parkingArea'
      },
    },

    {
      $unwind: '$parkingArea'
    },
    {
      $lookup: {
        from: 'provinces',
        localField: 'parkingArea.province',
        foreignField: '_id',
        as: 'province'
      },
    },
    {
      $unwind: '$province'
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'parkingArea.district',
        foreignField: '_id',
        as: 'district'
      },
    },
    {
      $unwind: '$district'
    },
    {
      $lookup: {
        from: 'cities',
        localField: 'parkingArea.city',
        foreignField: '_id',
        as: 'city'
      },
    },
    {
      $unwind: '$city'
    },
    {
      $project: {
        slotCount: 1,
        slots: { $slice: ['$slots', filteredSlotsCount] },
        price: 1,
        parkingArea: {
          _id: 1,
          name: 1,
          addressLine1: 1,
          addressLine2: 1,
          location: 1,
          contactNumber: 1,
          email: 1,
          district: '$district.name',
          city: '$city.name',
          province: '$province.name',
          averageRating: 1,
        }
      }
    }
    // {
    //   $project: {
    //     rejectedreservations: 1,
    //     slotNumber: 1,
    //   }
    // }

  ])
  console.log(JSON.stringify(parkingSlots, null, 2), "parkingSlots");
  return parkingSlots;
};





