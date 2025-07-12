import { BaseResponse } from "../../base/controller/responses/base.repsonse";
import { PaymentStatus } from "../../parkingSubscriptionFee/data/dtos/subscriptionPayment.dto";
import { ParkingAreaDTO, ParkingAreaModel } from "../data/dtos/parkingArea.dto";
import { Types } from "mongoose";
export const createParkingArea = async (parkingAreaData: Partial<ParkingAreaModel>) => {
  const parkingArea = new ParkingAreaDTO(parkingAreaData);
  return await parkingArea.save();
};

export const updateParkingArea = async (id: string, parkingAreaData: Partial<ParkingAreaModel>) => {
  const parkingArea = await ParkingAreaDTO.findByIdAndUpdate(
    id,
    { $set: parkingAreaData },
    { new: true }
  );
  if (!parkingArea) {
    throw new Error("Parking area not found");
  }
  return parkingArea;
};

export const deleteParkingArea = async (id: string) => {
  const parkingArea = await ParkingAreaDTO.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!parkingArea) {
    throw new Error("Parking area not found");
  }
  return parkingArea;
};

export const getParkingAreaById = async (id: string) => {
  return await ParkingAreaDTO.findOne({ _id: id, isDeleted: false }).populate('province city district', 'name').populate('managerIds ownerId', 'firstName lastName email phoneNumber').populate('parkingSubscriptionPaymentId', 'amount subscriptionEndDate subscriptionStartDate');
};

export const getAllParkingAreas = async (query: any,page:number,limit:number) => {
  const skip = (page - 1) * limit;
  const total = await ParkingAreaDTO.countDocuments({ isDeleted: { $ne: true }, ...query });
  const parkingAreas = await ParkingAreaDTO.find({ isDeleted: { $ne: true }, ...query }).skip(skip).limit(limit);
  return {
    data: parkingAreas,
    total: total
  };
};

export const getActiveParkingAreas = async (coords: { lng: number, lat: number },radius:number=10000): Promise<ParkingAreaModel[]> => {
  console.log(coords,radius,"coords");
  return await ParkingAreaDTO.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [coords.lng, coords.lat]
        },
        distanceField: "distance",
        maxDistance: radius,
        distanceMultiplier: 1,
        query: {
          isActive: true,
          isDeleted: {$ne:true}
        },
        spherical: true
      }
    },
    {
      $match: {
        isActive: true,
        isDeleted: {$ne:true}
      }
    },
    {
      $lookup: {
        from: 'subscriptionpayments',
        localField: 'parkingSubscriptionPaymentId',
        foreignField: '_id',
        as: 'subscriptionPayment'
      }
    },
    {
      $unwind: '$subscriptionPayment'
    },
    {
      $match: {
        'subscriptionPayment.subscriptionEndDate': { $gt: new Date() },
        'subscriptionPayment.paymentStatus': { $eq: PaymentStatus.SUCCESS },
        'subscriptionPayment.isDeleted': { $ne: true }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        location: 1,
        contactNumber: 1,
        email: 1,
        images: 1,
        description: 1,
        addressLine1: 1,
        addressLine2: 1,
        city: 1,
        district: 1,
        province: 1,
      }
    }
    ])


};

export const getParkingAreasByOwnerId = async (ownerId: string) => {

    const parkingAreas = await ParkingAreaDTO.find({ ownerId: new Types.ObjectId(ownerId), isDeleted: { $ne: true } })
        .populate('city')
        .populate('district')
        .populate('province')
        .populate('parkingSubscriptionPaymentId', 'amount paymentDate paymentMethod paymentStatus paymentReference paymentGateway subscriptionEndDate').lean();
        return parkingAreas;
};
export const updateParkingAreaByOwnerId = async (ownerId: string, data: Partial<ParkingAreaModel>) => {
  return await ParkingAreaDTO.updateMany({ ownerId: new Types.ObjectId(ownerId) }, { $set: data });
};

export const deleteParkingAreaByOwnerId = async (ownerId: string) => {
  await ParkingAreaDTO.deleteMany({ ownerId: new Types.ObjectId(ownerId) });
  return { status: true, message: 'Parking area deleted successfully' } as BaseResponse;
};

// export const updateAvailableSlots = async (id: string, change: number) => {
//   const parkingArea = await ParkingAreaDTO.findById(id);
//   if (!parkingArea) {
//     throw new Error("Parking area not found");
//   }

//   const newAvailableSlots = parkingArea.availableSlots + change;
//   if (newAvailableSlots < 0 || newAvailableSlots > parkingArea.totalSlots) {
//     throw new Error("Invalid available slots count");
//   }

//   return await ParkingAreaDTO.findByIdAndUpdate(
//     id,
//     { $set: { availableSlots: newAvailableSlots } },
//     { new: true }
//   );
// }; 