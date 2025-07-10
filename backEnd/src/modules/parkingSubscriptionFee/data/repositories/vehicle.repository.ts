import { VehicleModel, VehicleDTO } from "../dtos/vehicle.dto";

export const VehicleRepository = {
  create: async (data: Partial<VehicleModel>): Promise<VehicleModel> => {
    return await VehicleDTO.create(data);
  },

  findById: async (id: string): Promise<VehicleModel | null> => {
    return await VehicleDTO.findById(id);
  },

  find: async (filter: any = {}): Promise<VehicleModel[]> => {
    return await VehicleDTO.find(filter);
  },

  findByVehicleType: async (vehicleType: string): Promise<VehicleModel | null> => {
    return await VehicleDTO.findOne({ vehicleType, isDeleted: false });
  },

  findActiveVehicles: async (): Promise<VehicleModel[]> => {
    return await VehicleDTO.find({ isDeleted: false });
  },

  findByIdAndUpdate: async (id: string, data: Partial<VehicleModel>): Promise<VehicleModel | null> => {
    return await VehicleDTO.findByIdAndUpdate(id, data, { new: true });
  },

  findByIdAndDelete: async (id: string): Promise<VehicleModel | null> => {
    return await VehicleDTO.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}; 