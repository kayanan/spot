import { ParkingSubscriptionFeeDTO } from "../dtos/parkingSubscriptionFee.dto";
import { Document } from "mongoose";

export const createParkingSubscriptionFee = async (data: Partial<Document>) => {
  return await ParkingSubscriptionFeeDTO.create(data);
};

export const updateParkingSubscriptionFee = async (id: string, data: Partial<Document>) => {
  return await ParkingSubscriptionFeeDTO.findByIdAndUpdate(id, data, { new: true });
};

export const deleteParkingSubscriptionFee = async (id: string) => {
  return await ParkingSubscriptionFeeDTO.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

export const findParkingSubscriptionFeeById = async (id: string) => {
  return await ParkingSubscriptionFeeDTO.findOne({ _id: id});
};

export const findAllParkingSubscriptionFees = async () => {
  return await ParkingSubscriptionFeeDTO.find({ isDeleted: false }).populate("createdBy vehicleType");
};

export const findByVehicleType = async (vehicleType: string) => {
  return await ParkingSubscriptionFeeDTO.findOne({ vehicleType:vehicleType.toLowerCase(), isDeleted: false ,endDate:{$gt:new Date()}});
};

export const findActiveFees = async () => {
  const currentDate = new Date();
  return await ParkingSubscriptionFeeDTO.find({
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
    isDeleted: false
  }).populate("vehicleType");
}; 

export const findVehicleTypes = async () => {
  return await ParkingSubscriptionFeeDTO.distinct("vehicleType",{isDeleted:false,endDate:{$gte:new Date()}});
};