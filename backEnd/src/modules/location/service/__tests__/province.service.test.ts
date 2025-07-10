import {
  getProvinces,
  getProvince,
  createProvince,
  updateProvince,
  softDelete
} from '../province.service';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { ProvinceDTO, ProvinceModel } from '../../data/dtos/province.dto';
import { DistrictDTO, DistrictModel } from '../../data/dtos/district.dto';
import { CityDTO } from '../../data/dtos/city.dto';
import districtRepository from '../../data/repository/district.repository';
import { createUpdateProvincealidator } from '../../validators/province.validator';
import { isValidObjectId } from 'mongoose';
import { ZodError } from 'zod';

jest.mock('@/modules/base/data/repository/base.repository');
jest.mock('../../data/dtos/province.dto');
jest.mock('../../data/dtos/district.dto');
jest.mock('../../data/dtos/city.dto');
jest.mock('../../data/repository/district.repository');
jest.mock('../../validators/province.validator');
jest.mock('mongoose');

const mockBaseRepository = BaseRepository as jest.Mocked<typeof BaseRepository>;
const mockDistrictRepository = districtRepository as jest.Mocked<typeof districtRepository>;
const mockCreateUpdateProvincealidator = createUpdateProvincealidator as jest.MockedFunction<typeof createUpdateProvincealidator>;
const mockIsValidObjectId = isValidObjectId as jest.MockedFunction<typeof isValidObjectId>;

describe('Province Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvinces', () => {
    const mockListRequest = {
      search: 'test',
      skip: 0,
      limit: 10
    };
    const mockProvinces = [
      {
        _id: 'prov-id',
        name: 'Test Province',
        isActive: true,
        isDeleted: false,
        description: 'desc',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] as any[];

    it('should return provinces with search filter', async () => {
      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 1,
        items: mockProvinces
      });
      const result = await getProvinces(mockListRequest as any);
      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        ProvinceDTO,
        {
          isDeleted: false,
          $or: {
            name: {
              $regex: '.*test',
              $options: 'i'
            }
          }
        },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 1,
        provinces: mockProvinces
      });
    });

    it('should return provinces without search filter', async () => {
      mockBaseRepository.findAll.mockResolvedValue({ totalCount: 0, items: [] });
      const req = { skip: 0, limit: 10 };
      const result = await getProvinces(req as any);
      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        ProvinceDTO,
        { isDeleted: false },
        0,
        10
      );
      expect(result).toEqual({ status: true, totalCount: 0, provinces: [] });
    });
  });

  describe('getProvince', () => {
    const mockProvince = {
      _id: 'prov-id',
      name: 'Test Province',
      isActive: true,
      isDeleted: false,
      description: 'desc',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    it('should return province by valid id', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(mockProvince);
      const result = await getProvince('prov-id');
      expect(mockIsValidObjectId).toHaveBeenCalledWith('prov-id');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id');
      expect(result).toEqual({ status: true, province: mockProvince });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);
      await expect(getProvince('bad-id')).rejects.toThrow('Invalid province Id');
      expect(mockIsValidObjectId).toHaveBeenCalledWith('bad-id');
      expect(mockBaseRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when province not found', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(null);
      await expect(getProvince('prov-id')).rejects.toThrow('Province not found with prov-id');
      expect(mockIsValidObjectId).toHaveBeenCalledWith('prov-id');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id');
    });
  });

  describe('createProvince', () => {
    const mockCreateRequest = {
      name: 'New Province',
      isActive: true,
      description: 'desc'
    };
    const mockValidatedData = {
      name: 'New Province',
      isActive: true,
      description: 'desc'
    };

    it('should create province successfully', async () => {
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: mockValidatedData } as any);
      mockBaseRepository.create.mockResolvedValue('prov-id');
      const result = await createProvince(mockCreateRequest as any);
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(ProvinceDTO, mockValidatedData);
      expect(result).toEqual({ status: true, id: 'prov-id' });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateProvincealidator.mockReturnValue({ success: false, error: validationError } as any);
      await expect(createProvince(mockCreateRequest as any)).rejects.toThrow('[]');
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: mockValidatedData } as any);
      (mockBaseRepository.create as any).mockResolvedValue(null);
      await expect(createProvince(mockCreateRequest as any)).rejects.toThrow('Create fail');
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(ProvinceDTO, mockValidatedData);
    });
  });

  describe('updateProvince', () => {
    const mockUpdateRequest = {
      name: 'Updated Province',
      isActive: false,
      description: 'desc'
    };
    const mockValidatedData = {
      name: 'Updated Province',
      isActive: false,
      description: 'desc'
    };
    const mockUpdatedProvince = {
      _id: 'prov-id',
      name: 'Updated Province',
      isActive: false,
      isDeleted: false,
      description: 'desc',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
    const mockDistricts = [
      { _id: 'dist1' },
      { _id: 'dist2' }
    ] as any[];

    it('should update province and cascade deactivate districts and cities when isActive is false', async () => {
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: { ...mockValidatedData, isActive: false } } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedProvince, id: 'prov-id' });
      mockDistrictRepository.updateMany.mockResolvedValueOnce(mockDistricts).mockResolvedValueOnce([]);
      const result = await updateProvince('prov-id', { ...mockUpdateRequest, isActive: false } as any);
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith({ ...mockUpdateRequest, isActive: false });
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id', { ...mockValidatedData, isActive: false });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(DistrictDTO, { provinceId: 'prov-id' }, { isActive: false });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(CityDTO, { districtId: { $in: ['dist1', 'dist2'] } }, { isActive: false });
      expect(result).toEqual({ status: true, id: 'prov-id' });
    });

    it('should update province and cascade activate districts and cities when isActive is true', async () => {
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: { ...mockValidatedData, isActive: true } } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedProvince, id: 'prov-id' });
      mockDistrictRepository.updateMany.mockResolvedValueOnce(mockDistricts).mockResolvedValueOnce([]);
      const result = await updateProvince('prov-id', { ...mockUpdateRequest, isActive: true } as any);
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith({ ...mockUpdateRequest, isActive: true });
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id', { ...mockValidatedData, isActive: true });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(DistrictDTO, { provinceId: 'prov-id' }, { isActive: true });
      expect(mockDistrictRepository.updateMany).toHaveBeenCalledWith(CityDTO, { districtId: { $in: ['dist1', 'dist2'] } }, { isActive: true });
      expect(result).toEqual({ status: true, id: 'prov-id' });
    });

    it('should update province without cascading when isActive is not specified', async () => {
      const mockValidatedDataWithoutIsActive = {
        name: 'Updated Province',
        description: 'desc'
      };
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: mockValidatedDataWithoutIsActive } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedProvince, id: 'prov-id' });
      const result = await updateProvince('prov-id', mockUpdateRequest as any);
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id', mockValidatedDataWithoutIsActive);
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
      expect(result).toEqual({ status: true, id: 'prov-id' });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateProvincealidator.mockReturnValue({ success: false, error: validationError } as any);
      await expect(updateProvince('prov-id', mockUpdateRequest as any)).rejects.toThrow('[]');
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).not.toHaveBeenCalled();
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      const mockValidatedDataWithoutIsActive = {
        name: 'Updated Province',
        description: 'desc'
      };
      mockCreateUpdateProvincealidator.mockReturnValue({ success: true, data: mockValidatedDataWithoutIsActive } as any);
      mockBaseRepository.updateById.mockResolvedValue(null);
      await expect(updateProvince('prov-id', mockUpdateRequest as any)).rejects.toThrow('update fail');
      expect(mockCreateUpdateProvincealidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id', mockValidatedDataWithoutIsActive);
      expect(mockDistrictRepository.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete province successfully', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.softDeleteById.mockResolvedValue(undefined);
      const result = await softDelete('prov-id');
      expect(mockIsValidObjectId).toHaveBeenCalledWith('prov-id');
      expect(mockBaseRepository.softDeleteById).toHaveBeenCalledWith(ProvinceDTO, 'prov-id');
      expect(result).toEqual({ status: true });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);
      await expect(softDelete('bad-id')).rejects.toThrow('Invalid province id');
      expect(mockIsValidObjectId).toHaveBeenCalledWith('bad-id');
      expect(mockBaseRepository.softDeleteById).not.toHaveBeenCalled();
    });
  });
}); 