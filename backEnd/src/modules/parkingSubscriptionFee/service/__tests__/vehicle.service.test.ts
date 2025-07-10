import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleTypes,
  getVehicleByVehicleType
} from '../vehicle.service';
import { VehicleRepository } from '../../data/repositories/vehicle.repository';
import { VehicleModel } from '../../data/dtos/vehicle.dto';

jest.mock('../../data/repositories/vehicle.repository');
const mockRepo = VehicleRepository as jest.Mocked<typeof VehicleRepository>;

describe('Vehicle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('should create a vehicle', async () => {
      const data = { vehicleType: 'car', isDeleted: false, createdBy: 'user1' } as any;
      const created = { ...data, _id: 'id1' };
      mockRepo.create.mockResolvedValue(created as any);
      const result = await createVehicle(data);
      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe('getVehicles', () => {
    it('should return all non-deleted vehicles', async () => {
      const vehicles = [
        { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' },
        { _id: 'id2', vehicleType: 'bike', isDeleted: false, createdBy: 'user2' }
      ];
      mockRepo.find.mockResolvedValue(vehicles as any);
      const result = await getVehicles();
      expect(mockRepo.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toEqual(vehicles);
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle by id', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      const result = await getVehicleById('id1');
      expect(mockRepo.findById).toHaveBeenCalledWith('id1');
      expect(result).toEqual(vehicle);
    });
    it('should throw if vehicle not found', async () => {
      mockRepo.findById.mockResolvedValue(null as any);
      await expect(getVehicleById('id1')).rejects.toThrow('Vehicle not found');
    });
    it('should throw if vehicle is deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: true, createdBy: 'user1' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      await expect(getVehicleById('id1')).rejects.toThrow('Vehicle not found');
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle if exists and not deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' };
      const updated = { ...vehicle, vehicleType: 'van' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      mockRepo.findByIdAndUpdate.mockResolvedValue(updated as any);
      const result = await updateVehicle('id1', { vehicleType: 'van' });
      expect(mockRepo.findById).toHaveBeenCalledWith('id1');
      expect(mockRepo.findByIdAndUpdate).toHaveBeenCalledWith('id1', { vehicleType: 'van' });
      expect(result).toEqual(updated);
    });
    it('should throw if vehicle not found', async () => {
      mockRepo.findById.mockResolvedValue(null as any);
      await expect(updateVehicle('id1', { vehicleType: 'van' })).rejects.toThrow('Vehicle not found');
    });
    it('should throw if vehicle is deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: true, createdBy: 'user1' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      await expect(updateVehicle('id1', { vehicleType: 'van' })).rejects.toThrow('Vehicle not found');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle if exists and not deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      mockRepo.findByIdAndDelete.mockResolvedValue({ ...vehicle, isDeleted: true } as any);
      await deleteVehicle('id1');
      expect(mockRepo.findById).toHaveBeenCalledWith('id1');
      expect(mockRepo.findByIdAndDelete).toHaveBeenCalledWith('id1');
    });
    it('should throw if vehicle not found', async () => {
      mockRepo.findById.mockResolvedValue(null as any);
      await expect(deleteVehicle('id1')).rejects.toThrow('Vehicle not found');
    });
    it('should throw if vehicle is deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: true, createdBy: 'user1' };
      mockRepo.findById.mockResolvedValue(vehicle as any);
      await expect(deleteVehicle('id1')).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getVehicleTypes', () => {
    it('should return mapped vehicle types from active vehicles', async () => {
      const vehicles = [
        { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' },
        { _id: 'id2', vehicleType: 'bike', isDeleted: false, createdBy: 'user2' }
      ];
      mockRepo.findActiveVehicles.mockResolvedValue(vehicles as any);
      const result = await getVehicleTypes();
      expect(mockRepo.findActiveVehicles).toHaveBeenCalled();
      expect(result).toEqual([
        { _id: 'id1', vehicleType: 'car' },
        { _id: 'id2', vehicleType: 'bike' }
      ]);
    });
    it('should return empty array if no active vehicles', async () => {
      mockRepo.findActiveVehicles.mockResolvedValue([] as any);
      const result = await getVehicleTypes();
      expect(result).toEqual([]);
    });
  });

  describe('getVehicleByVehicleType', () => {
    it('should return vehicle by vehicleType (case-insensitive)', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: false, createdBy: 'user1' };
      mockRepo.findByVehicleType.mockResolvedValue(vehicle as any);
      const result = await getVehicleByVehicleType('Car');
      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toEqual(vehicle);
    });
    it('should throw if vehicle not found', async () => {
      mockRepo.findByVehicleType.mockResolvedValue(null as any);
      await expect(getVehicleByVehicleType('car')).rejects.toThrow('Vehicle not found');
    });
    it('should throw if vehicle is deleted', async () => {
      const vehicle = { _id: 'id1', vehicleType: 'car', isDeleted: true, createdBy: 'user1' };
      mockRepo.findByVehicleType.mockResolvedValue(vehicle as any);
      await expect(getVehicleByVehicleType('car')).rejects.toThrow('Vehicle not found');
    });
  });
}); 