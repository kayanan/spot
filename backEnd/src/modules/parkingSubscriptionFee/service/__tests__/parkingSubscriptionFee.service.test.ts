import {
  createFee,
  updateFee,
  deleteFee,
  getFeeById,
  getAllFees,
  getActiveFees,
  getFeeByVehicleType,
  getFeeForVehicle,
  getVehicleTypes
} from '../parkingSubscriptionFee.service';
import * as parkingSubscriptionFeeRepo from '../../data/repositories/parkingSubscriptionFee.repository';
import { ParkingSubscriptionFeeValidator } from '../../validators/parkingSubscriptionFee.validator';
import { VehicleDTO } from '../../data/dtos/vehicle.dto';

// Mock dependencies
jest.mock('../../data/repositories/parkingSubscriptionFee.repository');
jest.mock('../../validators/parkingSubscriptionFee.validator');
jest.mock('../../data/dtos/vehicle.dto');

const mockRepo = parkingSubscriptionFeeRepo as jest.Mocked<typeof parkingSubscriptionFeeRepo>;
const mockValidator = ParkingSubscriptionFeeValidator as jest.Mocked<typeof ParkingSubscriptionFeeValidator>;
const mockVehicleDTO = VehicleDTO as jest.Mocked<typeof VehicleDTO>;

describe('Parking Subscription Fee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFee', () => {
    const mockFeeData = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      vehicleType: '507f1f77bcf86cd799439011',
      below100: 50,
      between100and300: 100,
      between300and500: 150,
      above500: 200,
      createdBy: '507f1f77bcf86cd799439012'
    };

    const mockCreatedFee = {
      _id: '507f1f77bcf86cd799439013',
      ...mockFeeData,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create fee successfully', async () => {
      mockValidator.createFeeValidator.mockReturnValue({
        success: true,
        data: mockFeeData
      } as any);
      mockRepo.createParkingSubscriptionFee.mockResolvedValue(mockCreatedFee as any);

      const result = await createFee(mockFeeData as any);

      expect(mockValidator.createFeeValidator).toHaveBeenCalledWith(mockFeeData);
      expect(mockRepo.createParkingSubscriptionFee).toHaveBeenCalledWith(mockFeeData);
      expect(result).toEqual(mockCreatedFee);
    });

    it('should throw error when validation fails', async () => {
      const validationError = new Error('Validation failed');
      mockValidator.createFeeValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(createFee(mockFeeData as any)).rejects.toThrow('Validation failed');

      expect(mockValidator.createFeeValidator).toHaveBeenCalledWith(mockFeeData);
      expect(mockRepo.createParkingSubscriptionFee).not.toHaveBeenCalled();
    });
  });

  describe('updateFee', () => {
    const mockUpdateData = {
      below100: 60,
      between100and300: 120
    };

    const mockUpdatedFee = {
      _id: '507f1f77bcf86cd799439013',
      ...mockUpdateData,
      updatedAt: new Date()
    };

    it('should update fee successfully', async () => {
      mockValidator.updateFeeValidator.mockReturnValue({
        success: true,
        data: mockUpdateData
      } as any);
      mockRepo.updateParkingSubscriptionFee.mockResolvedValue(mockUpdatedFee as any);

      const result = await updateFee('507f1f77bcf86cd799439013', mockUpdateData);

      expect(mockValidator.updateFeeValidator).toHaveBeenCalledWith(mockUpdateData);
      expect(mockRepo.updateParkingSubscriptionFee).toHaveBeenCalledWith('507f1f77bcf86cd799439013', mockUpdateData);
      expect(result).toEqual(mockUpdatedFee);
    });

    it('should throw error when validation fails', async () => {
      const validationError = new Error('Validation failed');
      mockValidator.updateFeeValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(updateFee('507f1f77bcf86cd799439013', mockUpdateData)).rejects.toThrow('Validation failed');

      expect(mockValidator.updateFeeValidator).toHaveBeenCalledWith(mockUpdateData);
      expect(mockRepo.updateParkingSubscriptionFee).not.toHaveBeenCalled();
    });
  });

  describe('deleteFee', () => {
    it('should delete fee successfully', async () => {
      const mockDeletedFee = { _id: '507f1f77bcf86cd799439013', isDeleted: true };
      mockRepo.deleteParkingSubscriptionFee.mockResolvedValue(mockDeletedFee as any);

      const result = await deleteFee('507f1f77bcf86cd799439013');

      expect(mockRepo.deleteParkingSubscriptionFee).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(mockDeletedFee);
    });
  });

  describe('getFeeById', () => {
    it('should get fee by id successfully', async () => {
      const mockFee = { _id: '507f1f77bcf86cd799439013', below100: 50 };
      mockRepo.findParkingSubscriptionFeeById.mockResolvedValue(mockFee as any);

      const result = await getFeeById('507f1f77bcf86cd799439013');

      expect(mockRepo.findParkingSubscriptionFeeById).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toEqual(mockFee);
    });
  });

  describe('getAllFees', () => {
    it('should get all fees successfully', async () => {
      const mockFees = [
        { _id: '507f1f77bcf86cd799439013', below100: 50 },
        { _id: '507f1f77bcf86cd799439014', below100: 60 }
      ];
      mockRepo.findAllParkingSubscriptionFees.mockResolvedValue(mockFees as any);

      const result = await getAllFees();

      expect(mockRepo.findAllParkingSubscriptionFees).toHaveBeenCalled();
      expect(result).toEqual(mockFees);
    });
  });

  describe('getActiveFees', () => {
    it('should get active fees successfully', async () => {
      const mockActiveFees = [
        { _id: '507f1f77bcf86cd799439013', isDeleted: false }
      ];
      mockRepo.findActiveFees.mockResolvedValue(mockActiveFees as any);

      const result = await getActiveFees();

      expect(mockRepo.findActiveFees).toHaveBeenCalled();
      expect(result).toEqual(mockActiveFees);
    });
  });

  describe('getFeeByVehicleType', () => {
    it('should get fee by vehicle type successfully', async () => {
      const mockFee = { _id: '507f1f77bcf86cd799439013', vehicleType: 'car' };
      mockRepo.findByVehicleType.mockResolvedValue(mockFee as any);

      const result = await getFeeByVehicleType('car');

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toEqual(mockFee);
    });
  });

  describe('getFeeForVehicle', () => {
    const mockFee = {
      _id: '507f1f77bcf86cd799439013',
      below100: 50,
      between100and300: 100,
      between300and500: 150,
      above500: 200
    };

    beforeEach(() => {
      mockRepo.findByVehicleType.mockResolvedValue(mockFee as any);
    });

    it('should return below100 fee for count <= 100', async () => {
      const result = await getFeeForVehicle('car', 50);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toBe(50);
    });

    it('should return between100and300 fee for count <= 300', async () => {
      const result = await getFeeForVehicle('car', 200);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toBe(100);
    });

    it('should return between300and500 fee for count <= 500', async () => {
      const result = await getFeeForVehicle('car', 400);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toBe(150);
    });

    it('should return above500 fee for count > 500', async () => {
      const result = await getFeeForVehicle('car', 600);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toBe(200);
    });

    it('should return null when fee not found', async () => {
      mockRepo.findByVehicleType.mockResolvedValue(null);

      const result = await getFeeForVehicle('car', 50);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
      expect(result).toBeNull();
    });

    it('should convert vehicle type to lowercase', async () => {
      await getFeeForVehicle('CAR', 50);

      expect(mockRepo.findByVehicleType).toHaveBeenCalledWith('car');
    });
  });

  describe('getVehicleTypes', () => {
    it('should get vehicle types successfully', async () => {
      const mockVehicleTypeIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const mockVehicleTypes = [
        { _id: '507f1f77bcf86cd799439011', vehicleType: 'car' },
        { _id: '507f1f77bcf86cd799439012', vehicleType: 'motorcycle' }
      ];

      mockRepo.findVehicleTypes.mockResolvedValue(mockVehicleTypeIds as any);
      mockVehicleDTO.find.mockResolvedValue(mockVehicleTypes as any);

      const result = await getVehicleTypes();

      expect(mockRepo.findVehicleTypes).toHaveBeenCalled();
      expect(mockVehicleDTO.find).toHaveBeenCalledWith({ _id: { $in: mockVehicleTypeIds } });
      expect(result).toEqual([
        { _id: '507f1f77bcf86cd799439011', vehicleType: 'car' },
        { _id: '507f1f77bcf86cd799439012', vehicleType: 'motorcycle' }
      ]);
    });

    it('should handle empty vehicle types', async () => {
      mockRepo.findVehicleTypes.mockResolvedValue([] as any);
      mockVehicleDTO.find.mockResolvedValue([] as any);

      const result = await getVehicleTypes();

      expect(mockRepo.findVehicleTypes).toHaveBeenCalled();
      expect(mockVehicleDTO.find).toHaveBeenCalledWith({ _id: { $in: [] } });
      expect(result).toEqual([]);
    });
  });
}); 