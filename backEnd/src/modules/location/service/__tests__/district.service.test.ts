import { getDistricts, getDistrict, createDistrict, updateDistrict, softDeleteDistrict } from '../district.service';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { DistrictDTO, DistrictModel } from '../../data/dtos/district.dto';
import { CityDTO } from '../../data/dtos/city.dto';
import districtRepository from '../../data/repository/district.repository';
import { DistrictListRequest, CreateUpdateDistrictRequest } from '../../controller/request/create.district.request';
import { createUpdateDistrictValidator } from '../../validators/district.validator';
import { isValidObjectId } from 'mongoose';
import { ZodError } from 'zod';

// Mock dependencies
jest.mock('@/modules/base/data/repository/base.repository');
jest.mock('../../data/dtos/district.dto');
jest.mock('../../data/dtos/city.dto');
jest.mock('../../data/repository/district.repository');
jest.mock('../../validators/district.validator');
jest.mock('mongoose');

const mockBaseRepository = BaseRepository as jest.Mocked<typeof BaseRepository>;
const mockDistrictRepository = districtRepository as jest.Mocked<typeof districtRepository>;
const mockCreateUpdateDistrictValidator = createUpdateDistrictValidator as jest.MockedFunction<typeof createUpdateDistrictValidator>;
const mockIsValidObjectId = isValidObjectId as jest.MockedFunction<typeof isValidObjectId>;

describe('District Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDistricts', () => {
    const mockDistrictListRequest: DistrictListRequest = {
      search: 'test',
      provinceId: '507f1f77bcf86cd799439011',
      skip: 0,
      limit: 10
    };

    const mockDistricts = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test District',
        isActive: true,
        provinceId: '507f1f77bcf86cd799439012',
        isDeleted: false,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] as any[];

    it('should return districts with search and province filter', async () => {
      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 1,
        items: mockDistricts
      });

      const result = await getDistricts(mockDistrictListRequest);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        DistrictDTO,
        {
          isDeleted: false,
          $or: {
            name: {
              $regex: '.*test',
              $options: 'i'
            }
          },
          provinceId: '507f1f77bcf86cd799439011'
        },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 1,
        districts: mockDistricts
      });
    });

    it('should return districts without search filter', async () => {
      const requestWithoutSearch: DistrictListRequest = {
        skip: 0,
        limit: 10
      };

      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 0,
        items: []
      });

      const result = await getDistricts(requestWithoutSearch);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        DistrictDTO,
        { isDeleted: false },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 0,
        districts: []
      });
    });

    it('should return districts with only province filter', async () => {
      const requestWithProvinceOnly: DistrictListRequest = {
        provinceId: '507f1f77bcf86cd799439011',
        skip: 0,
        limit: 10
      };

      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 1,
        items: mockDistricts
      });

      const result = await getDistricts(requestWithProvinceOnly);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        DistrictDTO,
        {
          isDeleted: false,
          provinceId: '507f1f77bcf86cd799439011'
        },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 1,
        districts: mockDistricts
      });
    });
  });

  describe('getDistrict', () => {
    const mockDistrict = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test District',
      isActive: true,
      provinceId: '507f1f77bcf86cd799439012',
      isDeleted: false,
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    it('should return district by valid id', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(mockDistrict);

      const result = await getDistrict('507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011');
      expect(result).toEqual({
        status: true,
        district: mockDistrict
      });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);

      await expect(getDistrict('invalid-id')).rejects.toThrow('Invalid district Id');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('invalid-id');
      expect(mockBaseRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when district not found', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(null);

      await expect(getDistrict('507f1f77bcf86cd799439011')).rejects.toThrow('District not found with 507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011');
    });
  });

  describe('createDistrict', () => {
    const mockCreateRequest: CreateUpdateDistrictRequest = {
      name: 'New District',
      isActive: true,
      provinceId: '507f1f77bcf86cd799439012',
      description: 'New district description'
    };

    const mockValidatedData = {
      name: 'New District',
      isActive: true,
      provinceId: '507f1f77bcf86cd799439012',
      description: 'New district description'
    };

    it('should create district successfully', async () => {
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      mockBaseRepository.create.mockResolvedValue('507f1f77bcf86cd799439011');

      const result = await createDistrict(mockCreateRequest);

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(DistrictDTO, mockValidatedData);
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(createDistrict(mockCreateRequest)).rejects.toThrow('[]');

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      (mockBaseRepository.create as any).mockResolvedValue(null);

      await expect(createDistrict(mockCreateRequest)).rejects.toThrow('Create fail');

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(DistrictDTO, mockValidatedData);
    });
  });

  describe('updateDistrict', () => {
    const mockUpdateRequest: CreateUpdateDistrictRequest = {
      name: 'Updated District',
      isActive: false,
      provinceId: '507f1f77bcf86cd799439012',
      description: 'Updated district description'
    };

    const mockValidatedData = {
      name: 'Updated District',
      isActive: false,
      provinceId: '507f1f77bcf86cd799439012',
      description: 'Updated district description'
    };

    const mockUpdatedDistrict = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Updated District',
      isActive: false,
      provinceId: '507f1f77bcf86cd799439012',
      isDeleted: false,
      description: 'Updated district description',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    it('should update district successfully when isActive is false', async () => {
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: { ...mockValidatedData, isActive: false }
      } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedDistrict, id: '507f1f77bcf86cd799439011' });
      mockDistrictRepository.updateMany.mockResolvedValue([]);

      const result = await updateDistrict('507f1f77bcf86cd799439011', { ...mockUpdateRequest, isActive: false });

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith({ ...mockUpdateRequest, isActive: false });
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011', { ...mockValidatedData, isActive: false });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(CityDTO, { districtId: '507f1f77bcf86cd799439011' }, { isActive: false });
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should update district successfully when isActive is true', async () => {
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: { ...mockValidatedData, isActive: true }
      } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedDistrict, id: '507f1f77bcf86cd799439011' });
      mockDistrictRepository.updateMany.mockResolvedValue([]);

      const result = await updateDistrict('507f1f77bcf86cd799439011', { ...mockUpdateRequest, isActive: true });

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith({ ...mockUpdateRequest, isActive: true });
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011', { ...mockValidatedData, isActive: true });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(CityDTO, { districtId: '507f1f77bcf86cd799439011' }, { isActive: true });
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should update district successfully when isActive is not specified', async () => {
      const mockValidatedDataWithoutIsActive = {
        name: 'Updated District',
        provinceId: '507f1f77bcf86cd799439012',
        description: 'Updated district description'
      };
      
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: mockValidatedDataWithoutIsActive
      } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedDistrict, id: '507f1f77bcf86cd799439011' });

      const result = await updateDistrict('507f1f77bcf86cd799439011', mockUpdateRequest);

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011', mockValidatedDataWithoutIsActive);
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(updateDistrict('507f1f77bcf86cd799439011', mockUpdateRequest)).rejects.toThrow('[]');

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).not.toHaveBeenCalled();
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      const mockValidatedDataWithoutIsActive = {
        name: 'Updated District',
        provinceId: '507f1f77bcf86cd799439012',
        description: 'Updated district description'
      };
      
      mockCreateUpdateDistrictValidator.mockReturnValue({
        success: true,
        data: mockValidatedDataWithoutIsActive
      } as any);
      mockBaseRepository.updateById.mockResolvedValue(null);

      await expect(updateDistrict('507f1f77bcf86cd799439011', mockUpdateRequest)).rejects.toThrow('Update fail');

      expect(mockCreateUpdateDistrictValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011', mockValidatedDataWithoutIsActive);
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteDistrict', () => {
    it('should soft delete district successfully', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.softDeleteById.mockResolvedValue(undefined);

      const result = await softDeleteDistrict('507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.softDeleteById).toHaveBeenCalledWith(DistrictDTO, '507f1f77bcf86cd799439011');
      expect(result).toEqual({
        status: true
      });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);

      await expect(softDeleteDistrict('invalid-id')).rejects.toThrow('Invalid district id');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('invalid-id');
      expect(mockBaseRepository.softDeleteById).not.toHaveBeenCalled();
    });
  });
}); 