import {
  createParkingArea,
  updateParkingArea,
  updateParkingAreaByOwnerId,
  deleteParkingArea,
  getParkingAreaById,
  getAllParkingAreas,
  getParkingAreasByOwnerId,
  deleteParkingAreaByOwnerId,
  checkDuplicateEntry,
  getNearestParkingSpots
} from '../parkingArea.service';
import * as parkingAreaRepository from '../../repository/parkingArea.repository';
import * as parkingSlotService from '../parkingSlot.service';
import * as smsService from '../../../base/services/sms.service';
import UserRepository from '../../../user/data/repository/user.repository';
import { ParkingAreaDTO, ParkingAreaModel } from '../../data/dtos/parkingArea.dto';
import { ParkingSlotDTO } from '../../data/dtos/parkingSlot.dto';
import { validateCreateParkingArea, validateUpdateParkingArea } from '../../validators/parkingArea.validator';
import { ZodError } from 'zod';

// Mock all dependencies
jest.mock('../../repository/parkingArea.repository');
jest.mock('../parkingSlot.service');
jest.mock('../../../base/services/sms.service');
jest.mock('../../../user/data/repository/user.repository');
jest.mock('../../data/dtos/parkingArea.dto');
jest.mock('../../data/dtos/parkingSlot.dto');
jest.mock('../../validators/parkingArea.validator');

const mockParkingAreaRepository = parkingAreaRepository as jest.Mocked<typeof parkingAreaRepository>;
const mockParkingSlotService = parkingSlotService as jest.Mocked<typeof parkingSlotService>;
const mockSmsService = smsService as jest.Mocked<typeof smsService>;
const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
const mockParkingAreaDTO = ParkingAreaDTO as jest.Mocked<typeof ParkingAreaDTO>;
const mockParkingSlotDTO = ParkingSlotDTO as jest.Mocked<typeof ParkingSlotDTO>;
const mockValidateCreateParkingArea = validateCreateParkingArea as jest.MockedFunction<typeof validateCreateParkingArea>;
const mockValidateUpdateParkingArea = validateUpdateParkingArea as jest.MockedFunction<typeof validateUpdateParkingArea>;

describe('Parking Area Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createParkingArea', () => {
    const mockParkingAreaData = {
      name: 'Test Parking Area',
      longitude: 79.8612,
      latitude: 6.9271,
      ownerId: '507f1f77bcf86cd799439011',
      contactNumber: '+94123456789',
      email: 'test@example.com',
      images: ['image1.jpg', 'image2.jpg'],
      description: 'Test description',
      addressLine1: 'Test Address Line 1',
      addressLine2: 'Test Address Line 2',
      city: '507f1f77bcf86cd799439012',
      district: '507f1f77bcf86cd799439013',
      province: '507f1f77bcf86cd799439014',
      postalCode: '12345',
      slot: [
        { type: 'car', count: 10 },
        { type: 'motorcycle', count: 20 }
      ]
    };

    const mockCreatedParkingArea = {
      _id: '507f1f77bcf86cd799439015',
      name: 'Test Parking Area',
      location: {
        type: 'Point',
        coordinates: [79.8612, 6.9271]
      },
      ownerId: '507f1f77bcf86cd799439011',
      contactNumber: '+94123456789',
      email: 'test@example.com',
      images: ['image1.jpg', 'image2.jpg'],
      description: 'Test description',
      addressLine1: 'Test Address Line 1',
      addressLine2: 'Test Address Line 2',
      city: '507f1f77bcf86cd799439012',
      district: '507f1f77bcf86cd799439013',
      province: '507f1f77bcf86cd799439014',
      postalCode: '12345',
      isActive: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockOwner = {
      _id: '507f1f77bcf86cd799439011',
      phoneNumber: '0712345678',
      email: 'owner@example.com'
    };

    it('should create parking area successfully', async () => {
      mockValidateCreateParkingArea.mockReturnValue({ success: true, data: mockParkingAreaData } as any);
      mockParkingAreaRepository.createParkingArea.mockResolvedValue(mockCreatedParkingArea as any);
      mockUserRepository.findById.mockResolvedValue(mockOwner as any);
      mockParkingSlotService.createSlot.mockResolvedValue([] as any);
      mockSmsService.sendSMS.mockResolvedValue(undefined as any);

      const result = await createParkingArea(mockParkingAreaData);

      expect(mockValidateCreateParkingArea).toHaveBeenCalledWith(mockParkingAreaData);
      expect(mockParkingAreaRepository.createParkingArea).toHaveBeenCalledWith({
        ...mockParkingAreaData,
        location: {
          type: 'Point',
          coordinates: [79.8612, 6.9271]
        },
        isActive: false
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockParkingSlotService.createSlot).toHaveBeenCalledWith([
        {
          slotDetails: {
            vehicleType: 'car',
            isActive: false,
            isDeleted: false
          },
          count: 10,
          parkingAreaId: '507f1f77bcf86cd799439015'
        },
        {
          slotDetails: {
            vehicleType: 'motorcycle',
            isActive: false,
            isDeleted: false
          },
          count: 20,
          parkingAreaId: '507f1f77bcf86cd799439015'
        }
      ]);
      expect(mockSmsService.sendSMS).toHaveBeenCalledWith(
        '94712345678',
        expect.stringContaining('Your parking area creation request has been successfully submitted')
      );
      expect(result).toEqual(mockCreatedParkingArea);
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockValidateCreateParkingArea.mockReturnValue({ success: false, error: validationError } as any);

      await expect(createParkingArea(mockParkingAreaData)).rejects.toThrow('Validation failed');

      expect(mockValidateCreateParkingArea).toHaveBeenCalledWith(mockParkingAreaData);
      expect(mockParkingAreaRepository.createParkingArea).not.toHaveBeenCalled();
    });

    it('should throw error when owner mobile number not found', async () => {
      mockValidateCreateParkingArea.mockReturnValue({ success: true, data: mockParkingAreaData } as any);
      mockParkingAreaRepository.createParkingArea.mockResolvedValue(mockCreatedParkingArea as any);
      mockUserRepository.findById.mockResolvedValue({ ...mockOwner, phoneNumber: undefined } as any);

      await expect(createParkingArea(mockParkingAreaData)).rejects.toThrow('Mobile number not found');

      expect(mockValidateCreateParkingArea).toHaveBeenCalledWith(mockParkingAreaData);
      expect(mockParkingAreaRepository.createParkingArea).toHaveBeenCalled();
      expect(mockSmsService.sendSMS).not.toHaveBeenCalled();
    });

    it('should create parking area without slots when slot data is not provided', async () => {
      const parkingAreaDataWithoutSlots = { ...mockParkingAreaData };
      delete (parkingAreaDataWithoutSlots as any).slot;

      mockValidateCreateParkingArea.mockReturnValue({ success: true, data: parkingAreaDataWithoutSlots } as any);
      mockParkingAreaRepository.createParkingArea.mockResolvedValue(mockCreatedParkingArea as any);
      mockUserRepository.findById.mockResolvedValue(mockOwner as any);
      mockSmsService.sendSMS.mockResolvedValue(undefined as any);

      const result = await createParkingArea(parkingAreaDataWithoutSlots);

      expect(mockParkingSlotService.createSlot).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreatedParkingArea);
    });
  });

  describe('updateParkingArea', () => {
    const mockUpdateData = {
      name: 'Updated Parking Area',
      contactNumber: '+94123456789',
      email: 'updated@example.com',
      isActive: true
    };

    const mockUpdatedParkingArea = {
      _id: '507f1f77bcf86cd799439015',
      ...mockUpdateData,
      updatedAt: new Date()
    };

    it('should update parking area successfully', async () => {
      mockValidateUpdateParkingArea.mockReturnValue({ success: true, data: mockUpdateData } as any);
      mockParkingAreaRepository.updateParkingArea.mockResolvedValue(mockUpdatedParkingArea as any);
      mockParkingSlotService.updateParkingSlotStatus.mockResolvedValue(undefined as any);

      const result = await updateParkingArea('507f1f77bcf86cd799439015', mockUpdateData as any);

      expect(mockValidateUpdateParkingArea).toHaveBeenCalledWith(mockUpdateData);
      expect(mockParkingSlotService.updateParkingSlotStatus).toHaveBeenCalledWith(['507f1f77bcf86cd799439015'], true);
      expect(mockParkingAreaRepository.updateParkingArea).toHaveBeenCalledWith('507f1f77bcf86cd799439015', mockUpdateData);
      expect(result).toEqual(mockUpdatedParkingArea);
    });

    it('should update parking area without updating slot status when isActive is not included', async () => {
      const updateDataWithoutIsActive = { name: 'Updated Parking Area' };
      mockValidateUpdateParkingArea.mockReturnValue({ success: true, data: updateDataWithoutIsActive } as any);
      mockParkingAreaRepository.updateParkingArea.mockResolvedValue(mockUpdatedParkingArea as any);

      const result = await updateParkingArea('507f1f77bcf86cd799439015', updateDataWithoutIsActive as any);

      expect(mockValidateUpdateParkingArea).toHaveBeenCalledWith(updateDataWithoutIsActive);
      expect(mockParkingSlotService.updateParkingSlotStatus).not.toHaveBeenCalled();
      expect(mockParkingAreaRepository.updateParkingArea).toHaveBeenCalledWith('507f1f77bcf86cd799439015', updateDataWithoutIsActive);
      expect(result).toEqual(mockUpdatedParkingArea);
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockValidateUpdateParkingArea.mockReturnValue({ success: false, error: validationError } as any);

      await expect(updateParkingArea('507f1f77bcf86cd799439015', mockUpdateData as any)).rejects.toThrow('Validation failed');

      expect(mockValidateUpdateParkingArea).toHaveBeenCalledWith(mockUpdateData);
      expect(mockParkingAreaRepository.updateParkingArea).not.toHaveBeenCalled();
    });
  });

  describe('updateParkingAreaByOwnerId', () => {
    const mockOwnerId = '507f1f77bcf86cd799439011';
    const mockUpdateData = { isActive: true };
    const mockParkingAreas = [
      { _id: '507f1f77bcf86cd799439015' },
      { _id: '507f1f77bcf86cd799439016' }
    ];

    it('should update parking areas by owner id successfully', async () => {
      mockParkingAreaRepository.updateParkingAreaByOwnerId.mockResolvedValue(undefined as any);
      mockParkingAreaRepository.getParkingAreasByOwnerId.mockResolvedValue(mockParkingAreas as any);
      mockParkingSlotService.updateParkingSlotStatus.mockResolvedValue(undefined as any);

      const result = await updateParkingAreaByOwnerId(mockOwnerId, mockUpdateData);

      expect(mockParkingAreaRepository.updateParkingAreaByOwnerId).toHaveBeenCalledWith(mockOwnerId, mockUpdateData);
      expect(mockParkingAreaRepository.getParkingAreasByOwnerId).toHaveBeenCalledWith(mockOwnerId);
      expect(mockParkingSlotService.updateParkingSlotStatus).toHaveBeenCalledWith(
        ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
        true
      );
      expect(result).toEqual(mockParkingAreas);
    });
  });

  describe('deleteParkingArea', () => {
    it('should delete parking area successfully', async () => {
      const mockDeletedParkingArea = { _id: '507f1f77bcf86cd799439015', name: 'Deleted Parking Area' };
      mockParkingAreaRepository.deleteParkingArea.mockResolvedValue(mockDeletedParkingArea as any);

      const result = await deleteParkingArea('507f1f77bcf86cd799439015');

      expect(mockParkingAreaRepository.deleteParkingArea).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
      expect(result).toEqual(mockDeletedParkingArea);
    });
  });

  describe('getParkingAreaById', () => {
    it('should get parking area by id successfully', async () => {
      const mockParkingArea = { _id: '507f1f77bcf86cd799439015', name: 'Test Parking Area' };
      mockParkingAreaRepository.getParkingAreaById.mockResolvedValue(mockParkingArea as any);

      const result = await getParkingAreaById('507f1f77bcf86cd799439015');

      expect(mockParkingAreaRepository.getParkingAreaById).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
      expect(result).toEqual(mockParkingArea);
    });
  });

  describe('getAllParkingAreas', () => {
    it('should get all parking areas successfully', async () => {
      const mockParkingAreas = [
        { _id: '507f1f77bcf86cd799439015', name: 'Parking Area 1' },
        { _id: '507f1f77bcf86cd799439016', name: 'Parking Area 2' }
      ];
      mockParkingAreaRepository.getAllParkingAreas.mockResolvedValue(mockParkingAreas as any);

      const result = await getAllParkingAreas();

      expect(mockParkingAreaRepository.getAllParkingAreas).toHaveBeenCalled();
      expect(result).toEqual(mockParkingAreas);
    });
  });

  describe('getParkingAreasByOwnerId', () => {
    const mockOwnerId = '507f1f77bcf86cd799439011';
    const mockParkingAreas = [
      { _id: '507f1f77bcf86cd799439015', name: 'Parking Area 1' },
      { _id: '507f1f77bcf86cd799439016', name: 'Parking Area 2' }
    ];
    const mockParkingSlots = [
      { _id: 'slot1', vehicleType: 'car' },
      { _id: 'slot2', vehicleType: 'motorcycle' }
    ];

    it('should get parking areas by owner id with slots successfully', async () => {
      mockParkingAreaRepository.getParkingAreasByOwnerId.mockResolvedValue(mockParkingAreas as any);
      mockParkingSlotService.getSlotsByParkingArea.mockResolvedValue(mockParkingSlots as any);

      const result = await getParkingAreasByOwnerId(mockOwnerId);

      expect(mockParkingAreaRepository.getParkingAreasByOwnerId).toHaveBeenCalledWith(mockOwnerId);
      expect(mockParkingSlotService.getSlotsByParkingArea).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
      expect(mockParkingSlotService.getSlotsByParkingArea).toHaveBeenCalledWith('507f1f77bcf86cd799439016');
      expect(result).toEqual([
        { ...mockParkingAreas[0], slots: mockParkingSlots },
        { ...mockParkingAreas[1], slots: mockParkingSlots }
      ]);
    });
  });

  describe('deleteParkingAreaByOwnerId', () => {
    const mockOwnerId = '507f1f77bcf86cd799439011';
    const mockParkingAreas = [
      { _id: '507f1f77bcf86cd799439015' },
      { _id: '507f1f77bcf86cd799439016' }
    ];

    it('should delete parking areas by owner id successfully', async () => {
      mockParkingAreaRepository.getParkingAreasByOwnerId.mockResolvedValue(mockParkingAreas as any);
      mockParkingSlotDTO.deleteMany.mockResolvedValue({ deletedCount: 2 } as any);
      mockParkingAreaRepository.deleteParkingAreaByOwnerId.mockResolvedValue(undefined as any);

      const result = await deleteParkingAreaByOwnerId(mockOwnerId);

      expect(mockParkingAreaRepository.getParkingAreasByOwnerId).toHaveBeenCalledWith(mockOwnerId);
      expect(mockParkingSlotDTO.deleteMany).toHaveBeenCalledWith({
        parkingAreaId: { $in: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'] }
      });
      expect(mockParkingAreaRepository.deleteParkingAreaByOwnerId).toHaveBeenCalledWith(mockOwnerId);
      expect(result).toEqual({ status: true, message: 'Parking area deleted successfully' });
    });

    it('should throw error when no parking areas found for owner', async () => {
      mockParkingAreaRepository.getParkingAreasByOwnerId.mockResolvedValue([] as any);

      await expect(deleteParkingAreaByOwnerId(mockOwnerId)).rejects.toThrow('Parking area not found');

      expect(mockParkingAreaRepository.getParkingAreasByOwnerId).toHaveBeenCalledWith(mockOwnerId);
      expect(mockParkingSlotDTO.deleteMany).not.toHaveBeenCalled();
      expect(mockParkingAreaRepository.deleteParkingAreaByOwnerId).not.toHaveBeenCalled();
    });
  });

  describe('checkDuplicateEntry', () => {
    it('should return no duplicate when no existing parking areas found', async () => {
      const mockData = { contactNumber: '+94123456789', email: 'test@example.com' };
      mockParkingAreaDTO.find.mockResolvedValue([] as any);

      const result = await checkDuplicateEntry(mockData);

      expect(mockParkingAreaDTO.find).toHaveBeenCalledWith({ $or: [{ contactNumber: '+94123456789' }, { email: 'test@example.com' }] });
      expect(result).toEqual({ status: true, message: 'No duplicate entry found' });
    });

    it('should return duplicate error for contact number', async () => {
      const mockData = { contactNumber: '+94123456789' };
      const mockExistingParkingAreas = [
        { contactNumber: '+94123456789', email: 'existing@example.com' }
      ];
      mockParkingAreaDTO.find.mockResolvedValue(mockExistingParkingAreas as any);

      const result = await checkDuplicateEntry(mockData);

      expect(mockParkingAreaDTO.find).toHaveBeenCalledWith({ $or: [{ contactNumber: '+94123456789' }] });
      expect(result).toEqual({
        status: false,
        message: 'Duplicate entry found',
        errorMessage: { contactNumber: 'Duplicate entry found' }
      });
    });

    it('should return duplicate error for email', async () => {
      const mockData = { email: 'test@example.com' };
      const mockExistingParkingAreas = [
        { contactNumber: '+94123456789', email: 'test@example.com' }
      ];
      mockParkingAreaDTO.find.mockResolvedValue(mockExistingParkingAreas as any);

      const result = await checkDuplicateEntry(mockData);

      expect(mockParkingAreaDTO.find).toHaveBeenCalledWith({ $or: [{ email: 'test@example.com' }] });
      expect(result).toEqual({
        status: false,
        message: 'Duplicate entry found',
        errorMessage: { email: 'Duplicate entry found' }
      });
    });

    it('should return duplicate error for both contact number and email', async () => {
      const mockData = { contactNumber: '+94123456789', email: 'test@example.com' };
      const mockExistingParkingAreas = [
        { contactNumber: '+94123456789', email: 'test@example.com' }
      ];
      mockParkingAreaDTO.find.mockResolvedValue(mockExistingParkingAreas as any);

      const result = await checkDuplicateEntry(mockData);

      expect(mockParkingAreaDTO.find).toHaveBeenCalledWith({ $or: [{ contactNumber: '+94123456789' }, { email: 'test@example.com' }] });
      expect(result).toEqual({
        status: false,
        message: 'Duplicate entry found',
        errorMessage: { contactNumber: 'Duplicate entry found', email: 'Duplicate entry found' }
      });
    });

    it('should handle case insensitive email comparison', async () => {
      const mockData = { email: 'TEST@EXAMPLE.COM' };
      const mockExistingParkingAreas = [
        { contactNumber: '+94123456789', email: 'test@example.com' }
      ];
      mockParkingAreaDTO.find.mockResolvedValue(mockExistingParkingAreas as any);

      const result = await checkDuplicateEntry(mockData);

      expect(result).toEqual({
        status: false,
        message: 'Duplicate entry found',
        errorMessage: { email: 'Duplicate entry found' }
      });
    });
  });

  describe('getNearestParkingSpots', () => {
    const mockCoords = { lng: 79.8612, lat: 6.9271 };
    const mockSlotFilterData = {
      vehicleType: 'car',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T12:00:00Z')
    };
    const mockParkingAreas = [
      { _id: '507f1f77bcf86cd799439015', name: 'Parking Area 1', slots: [] },
      { _id: '507f1f77bcf86cd799439016', name: 'Parking Area 2', slots: [] }
    ];

    it('should get nearest parking spots successfully', async () => {
      mockParkingAreaRepository.getActiveParkingAreas.mockResolvedValue(mockParkingAreas as any);
      mockParkingSlotService.filterParkingSlots.mockResolvedValue(mockParkingAreas as any);

      const result = await getNearestParkingSpots(mockCoords, 10000, mockSlotFilterData);

      expect(mockParkingAreaRepository.getActiveParkingAreas).toHaveBeenCalledWith(mockCoords, 10000);
      expect(mockParkingSlotService.filterParkingSlots).toHaveBeenCalledWith(mockSlotFilterData, mockParkingAreas);
      expect(result).toEqual(mockParkingAreas.map(item => {
        const { slots, ...rest } = item;
        return rest;
      }));
    });

    it('should use default radius when not provided', async () => {
      mockParkingAreaRepository.getActiveParkingAreas.mockResolvedValue(mockParkingAreas as any);
      mockParkingSlotService.filterParkingSlots.mockResolvedValue(mockParkingAreas as any);

      await getNearestParkingSpots(mockCoords, undefined, mockSlotFilterData);

      expect(mockParkingAreaRepository.getActiveParkingAreas).toHaveBeenCalledWith(mockCoords, 10000);
    });
  });
}); 