import { VehicleModel } from "../data/dtos/vehicle.dto";
import { VehicleRepository } from "../data/repositories/vehicle.repository";



export const createVehicle = async (data: Partial<VehicleModel>): Promise<VehicleModel> => {
    return await VehicleRepository.create(data);
  };

export const getVehicles = async (): Promise<VehicleModel[]> => {
    return await VehicleRepository.find({ isDeleted: false });
  };

export const getVehicleById = async (id: string): Promise<VehicleModel> => {
    const vehicle = await VehicleRepository.findById(id);
    if (!vehicle || vehicle.isDeleted) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  };

export const updateVehicle = async (id: string, data: Partial<VehicleModel>): Promise<VehicleModel> => {
    const vehicle = await VehicleRepository.findById(id);
    if (!vehicle || vehicle.isDeleted) {
      throw new Error("Vehicle not found");
    }
    return await VehicleRepository.findByIdAndUpdate(id, data) as VehicleModel;
  };

export const deleteVehicle = async (id: string): Promise<void> => {
    const vehicle = await VehicleRepository.findById(id);
    if (!vehicle || vehicle.isDeleted) {
      throw new Error("Vehicle not found");
    }
    await VehicleRepository.findByIdAndDelete(id);
  };

export const getVehicleTypes = async (): Promise<{ _id: string; vehicleType: string }[]> => {
    const vehicles = await VehicleRepository.findActiveVehicles();
    return vehicles.map(vehicle => ({ _id: vehicle._id as string, vehicleType: vehicle.vehicleType }));
  }

export const getVehicleByVehicleType = async (vehicleType: string): Promise<VehicleModel> => {
    const vehicle = await VehicleRepository.findByVehicleType(vehicleType.toLowerCase());
    if (!vehicle || vehicle.isDeleted) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  }
