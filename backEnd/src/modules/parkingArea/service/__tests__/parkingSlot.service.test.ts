import * as parkingSlotRepo from '../../repository/parkingSlot.repository';
import { ParkingSlotValidator } from '../../validators/parkingSlot.validator';
import {
  createSlot,
  updateSlot,
  updateSlotByParkingAreaId,
  deleteSlot,
  getSlotById,
  getAllSlots,
  getActiveSlots,
  getSlotsByParkingArea,
  deleteManySlots,
  updateParkingSlotStatus,
  filterParkingSlots
} from '../parkingSlot.service';

jest.mock('../../repository/parkingSlot.repository');
jest.mock('../../validators/parkingSlot.validator');

const mockRepo = parkingSlotRepo as jest.Mocked<typeof parkingSlotRepo>;
const mockValidator = ParkingSlotValidator as jest.Mocked<typeof ParkingSlotValidator>;

describe('Parking Slot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSlot', () => {
    const slotData = [
      {
        slotDetails: { vehicleType: 'car' } as Partial<any>,
        count: 2,
        parkingAreaId: 'area1'
      }
    ];
    const slotList = [
      { vehicleType: 'car', slotNumber: 1, parkingAreaId: 'area1', isActive: false, isDeleted: false },
      { vehicleType: 'car', slotNumber: 2, parkingAreaId: 'area1', isActive: false, isDeleted: false }
    ];

    it('should create slots successfully', async () => {
      mockValidator.createSlotValidator.mockReturnValue({ success: true, error: null } as any);
      mockRepo.createSlot.mockResolvedValue(slotList as any);
      const result = await createSlot(slotData);
      expect(mockValidator.createSlotValidator).toHaveBeenCalledWith([{ vehicleType: 'car' }]);
      expect(mockRepo.createSlot).toHaveBeenCalled();
      expect(result).toEqual(slotList);
    });

    it('should throw error when validation fails', async () => {
      mockValidator.createSlotValidator.mockReturnValue({ success: false, error: { message: 'Validation failed' } } as any);
      await expect(createSlot(slotData)).rejects.toThrow('Validation failed');
      expect(mockValidator.createSlotValidator).toHaveBeenCalledWith([{ vehicleType: 'car' }]);
      expect(mockRepo.createSlot).not.toHaveBeenCalled();
    });
  });

  describe('updateSlot', () => {
    const slotId = 'slot1';
    const slotData = { vehicleType: 'car' } as any;
    const updatedSlot = { _id: slotId, vehicleType: 'car' };

    it('should update slot successfully', async () => {
      mockValidator.updateSlotValidator.mockReturnValue({ success: true, error: null } as any);
      mockRepo.updateSlot.mockResolvedValue(updatedSlot as any);
      const result = await updateSlot(slotId, slotData);
      expect(mockValidator.updateSlotValidator).toHaveBeenCalledWith(slotData);
      expect(mockRepo.updateSlot).toHaveBeenCalledWith(slotId, slotData);
      expect(result).toEqual(updatedSlot);
    });

    it('should throw error when validation fails', async () => {
      mockValidator.updateSlotValidator.mockReturnValue({ success: false, error: { message: 'Validation failed' } } as any);
      await expect(updateSlot(slotId, slotData)).rejects.toThrow('Validation failed');
      expect(mockValidator.updateSlotValidator).toHaveBeenCalledWith(slotData);
      expect(mockRepo.updateSlot).not.toHaveBeenCalled();
    });
  });

  describe('updateSlotByParkingAreaId', () => {
    const parkingAreaId = 'area1';
    const slotData = { vehicleType: 'car', slotNumber: 1 } as any;
    const updatedSlot = { _id: 'slot1', vehicleType: 'car', slotNumber: 1 };

    it('should update slot by parking area id successfully', async () => {
      mockValidator.updateSlotValidator.mockReturnValue({ success: true, error: null } as any);
      mockRepo.updateSlotByParkingAreaId.mockResolvedValue(updatedSlot as any);
      const result = await updateSlotByParkingAreaId(parkingAreaId, slotData);
      expect(mockValidator.updateSlotValidator).toHaveBeenCalledWith(slotData);
      expect(mockRepo.updateSlotByParkingAreaId).toHaveBeenCalledWith(parkingAreaId, slotData);
      expect(result).toEqual(updatedSlot);
    });

    it('should throw error when validation fails', async () => {
      mockValidator.updateSlotValidator.mockReturnValue({ success: false, error: { message: 'Validation failed' } } as any);
      await expect(updateSlotByParkingAreaId(parkingAreaId, slotData)).rejects.toThrow('Validation failed');
      expect(mockValidator.updateSlotValidator).toHaveBeenCalledWith(slotData);
      expect(mockRepo.updateSlotByParkingAreaId).not.toHaveBeenCalled();
    });
  });

  describe('deleteSlot', () => {
    it('should delete slot successfully', async () => {
      const slot = { _id: 'slot1', vehicleType: 'car' };
      mockRepo.deleteSlot.mockResolvedValue(slot as any);
      const result = await deleteSlot('slot1');
      expect(mockRepo.deleteSlot).toHaveBeenCalledWith('slot1');
      expect(result).toEqual(slot);
    });
  });

  describe('getSlotById', () => {
    it('should get slot by id successfully', async () => {
      const slot = { _id: 'slot1', vehicleType: 'car' };
      mockRepo.getSlotById.mockResolvedValue(slot as any);
      const result = await getSlotById('slot1');
      expect(mockRepo.getSlotById).toHaveBeenCalledWith('slot1');
      expect(result).toEqual(slot);
    });
  });

  describe('getAllSlots', () => {
    it('should get all slots successfully', async () => {
      const slots = [{ _id: 'slot1' }, { _id: 'slot2' }];
      mockRepo.getAllSlots.mockResolvedValue(slots as any);
      const result = await getAllSlots();
      expect(mockRepo.getAllSlots).toHaveBeenCalled();
      expect(result).toEqual(slots);
    });
  });

  describe('getActiveSlots', () => {
    it('should get active slots successfully', async () => {
      const slots = [{ _id: 'slot1' }];
      mockRepo.getActiveSlots.mockResolvedValue(slots as any);
      const result = await getActiveSlots();
      expect(mockRepo.getActiveSlots).toHaveBeenCalled();
      expect(result).toEqual(slots);
    });
  });

  describe('getSlotsByParkingArea', () => {
    it('should get slots by parking area successfully', async () => {
      const slots = [{ _id: 'slot1' }, { _id: 'slot2' }];
      mockRepo.getSlotsByParkingArea.mockResolvedValue(slots as any);
      const result = await getSlotsByParkingArea('area1');
      expect(mockRepo.getSlotsByParkingArea).toHaveBeenCalledWith('area1');
      expect(result).toEqual({ success: true, data: slots });
    });
  });

  describe('deleteManySlots', () => {
    it('should delete many slots successfully', async () => {
      const resultData = { deletedCount: 2 };
      mockRepo.deleteManySlots.mockResolvedValue(resultData as any);
      const result = await deleteManySlots('area1');
      expect(mockRepo.deleteManySlots).toHaveBeenCalledWith('area1');
      expect(result).toEqual(resultData);
    });
  });

  describe('updateParkingSlotStatus', () => {
    it('should update parking slot status successfully', async () => {
      const resultData = { modifiedCount: 2 };
      mockRepo.updateParkingSlotStatus.mockResolvedValue(resultData as any);
      const result = await updateParkingSlotStatus(['area1', 'area2'], true);
      expect(mockRepo.updateParkingSlotStatus).toHaveBeenCalledWith(['area1', 'area2'], true);
      expect(result).toEqual(resultData);
    });
  });

  describe('filterParkingSlots', () => {
    it('should filter parking slots successfully', async () => {
      const slotFilterData = { vehicleType: 'car' };
      const parkingAreas = [{ _id: 'area1' }, { _id: 'area2' }];
      const filteredSlots = [{ _id: 'slot1' }, { _id: 'slot2' }];
      mockRepo.filterParkingSlots.mockResolvedValue(filteredSlots as any);
      const result = await filterParkingSlots(slotFilterData, parkingAreas);
      expect(mockRepo.filterParkingSlots).toHaveBeenCalledWith(slotFilterData, ['area1', 'area2']);
      expect(result).toEqual(filteredSlots);
    });
  });
}); 