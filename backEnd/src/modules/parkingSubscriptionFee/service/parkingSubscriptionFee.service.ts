import { ParkingSubscriptionFeeModel } from "../data/dtos/parkingSubscriptionFee.dto";
import { VehicleDTO } from "../data/dtos/vehicle.dto";
import {
  createParkingSubscriptionFee,
  updateParkingSubscriptionFee,
  deleteParkingSubscriptionFee,
  findParkingSubscriptionFeeById,
  findAllParkingSubscriptionFees,
  findActiveFees,
  findByVehicleType,
  findVehicleTypes
} from "../data/repositories/parkingSubscriptionFee.repository";
import { ParkingSubscriptionFeeValidator } from "../validators/parkingSubscriptionFee.validator";
import { Document } from "mongoose";
export const createFee = async (feeData: Omit<ParkingSubscriptionFeeModel, "isDeleted">) => {
    const valResult = ParkingSubscriptionFeeValidator.createFeeValidator(feeData);
    if(valResult.error){
        throw new Error(valResult.error.message);
    }
  return await createParkingSubscriptionFee(valResult.data as Partial<Document>);
};

export const updateFee = async (id: string, feeData: Partial<ParkingSubscriptionFeeModel>) => {
    const valResult = ParkingSubscriptionFeeValidator.updateFeeValidator(feeData);
    if(valResult.error){
        throw new Error(valResult.error.message);
    }
  return await updateParkingSubscriptionFee(id, feeData);
};

export const deleteFee = async (id: string) => {
  return await deleteParkingSubscriptionFee(id);
};

export const getFeeById = async (id: string) => {
  return await findParkingSubscriptionFeeById(id);
};

export const getAllFees = async () => {
  return await findAllParkingSubscriptionFees();
};

export const getActiveFees = async () => {
  return await findActiveFees();
};

export const getFeeByVehicleType = async (vehicleType: string) => {
  return await findByVehicleType(vehicleType);
};

export const getFeeForVehicle = async (vehicleType: string, count: number) => {
  const fee = await findByVehicleType(vehicleType.toLowerCase());
  if (!fee) return null;

  if (count <= 100) return fee.below100;
  if (count <= 300) return fee.between100and300;
  if (count <= 500) return fee.between300and500;
  return fee.above500;
}; 

export const getVehicleTypes = async () => {
   const vehicleTypes = await findVehicleTypes();
   const vehicleTypeNames = await VehicleDTO.find({_id:{$in:vehicleTypes}});
   return vehicleTypeNames.map((vehicleType) => {
    return {
      _id: vehicleType._id,
      vehicleType: vehicleType.vehicleType
    }
   });

};