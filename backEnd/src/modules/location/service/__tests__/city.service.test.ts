import { getCities, getCity, createCity, updateCity, softDeleteCity } from '../city.service';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { CityDTO, CityModel } from '../../data/dtos/city.dto';
import { CityListRequest, CreateUpdateCityRequest } from '../../controller/request/create.city.request';
import { createUpdateCityValidator } from '../../validators/city.validator';
import { isValidObjectId } from 'mongoose';
import { ZodError } from 'zod';

// Mock dependencies
jest.mock('@/modules/base/data/repository/base.repository');
jest.mock('../../data/dtos/city.dto');
jest.mock('../../validators/city.validator');
jest.mock('mongoose');

const mockBaseRepository = BaseRepository as jest.Mocked<typeof BaseRepository>;
const mockCreateUpdateCityValidator = createUpdateCityValidator as jest.MockedFunction<typeof createUpdateCityValidator>;
const mockIsValidObjectId = isValidObjectId as jest.MockedFunction<typeof isValidObjectId>;

describe('City Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCities', () => {
    const mockCityListRequest: CityListRequest = {
      search: 'test',
      districtId: '507f1f77bcf86cd799439011',
      skip: 0,
      limit: 10
    };

    const mockCities = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test City',
        isActive: true,
        districtId: '507f1f77bcf86cd799439012',
        isDeleted: false,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] as any[];

    it('should return cities with search and district filter', async () => {
      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 1,
        items: mockCities
      });

      const result = await getCities(mockCityListRequest);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        CityDTO,
        {
          isDeleted: false,
          $or: {
            name: {
              $regex: '.*test',
              $options: 'i'
            }
          },
          districtId: '507f1f77bcf86cd799439011'
        },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 1,
        cities: mockCities
      });
    });

    it('should return cities without search filter', async () => {
      const requestWithoutSearch: CityListRequest = {
        skip: 0,
        limit: 10
      };

      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 0,
        items: []
      });

      const result = await getCities(requestWithoutSearch);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        CityDTO,
        { isDeleted: false },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 0,
        cities: []
      });
    });

    it('should return cities with only district filter', async () => {
      const requestWithDistrictOnly: CityListRequest = {
        districtId: '507f1f77bcf86cd799439011',
        skip: 0,
        limit: 10
      };

      mockBaseRepository.findAll.mockResolvedValue({
        totalCount: 1,
        items: mockCities
      });

      const result = await getCities(requestWithDistrictOnly);

      expect(mockBaseRepository.findAll).toHaveBeenCalledWith(
        CityDTO,
        {
          isDeleted: false,
          districtId: '507f1f77bcf86cd799439011'
        },
        0,
        10
      );
      expect(result).toEqual({
        status: true,
        totalCount: 1,
        cities: mockCities
      });
    });
  });

  describe('getCity', () => {
    const mockCity = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test City',
      isActive: true,
      districtId: '507f1f77bcf86cd799439012',
      isDeleted: false,
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    it('should return city by valid id', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(mockCity);

      const result = await getCity('507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(CityDTO, '507f1f77bcf86cd799439011');
      expect(result).toEqual({
        status: true,
        city: mockCity
      });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);

      await expect(getCity('invalid-id')).rejects.toThrow('Invalid city Id');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('invalid-id');
      expect(mockBaseRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when city not found', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.findById.mockResolvedValue(null);

      await expect(getCity('507f1f77bcf86cd799439011')).rejects.toThrow('City not found with 507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.findById).toHaveBeenCalledWith(CityDTO, '507f1f77bcf86cd799439011');
    });
  });

  describe('createCity', () => {
    const mockCreateRequest: CreateUpdateCityRequest = {
      name: 'New City',
      isActive: true,
      districId: '507f1f77bcf86cd799439012',
      description: 'New city description'
    };

    const mockValidatedData = {
      name: 'New City',
      isActive: true,
      districtId: '507f1f77bcf86cd799439012',
      description: 'New city description'
    };

    it('should create city successfully', async () => {
      mockCreateUpdateCityValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      mockBaseRepository.create.mockResolvedValue('507f1f77bcf86cd799439011');

      const result = await createCity(mockCreateRequest);

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(CityDTO, mockValidatedData);
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateCityValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(createCity(mockCreateRequest)).rejects.toThrow('[]');

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      mockCreateUpdateCityValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      (mockBaseRepository.create as any).mockResolvedValue(null);

      await expect(createCity(mockCreateRequest)).rejects.toThrow('Create fail');

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockCreateRequest);
      expect(mockBaseRepository.create).toHaveBeenCalledWith(CityDTO, mockValidatedData);
    });
  });

  describe('updateCity', () => {
    const mockUpdateRequest: CreateUpdateCityRequest = {
      name: 'Updated City',
      isActive: false,
      districId: '507f1f77bcf86cd799439012',
      description: 'Updated city description'
    };

    const mockValidatedData = {
      name: 'Updated City',
      isActive: false,
      districtId: '507f1f77bcf86cd799439012',
      description: 'Updated city description'
    };

    const mockUpdatedCity = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Updated City',
      isActive: false,
      districtId: '507f1f77bcf86cd799439012',
      isDeleted: false,
      description: 'Updated city description',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    it('should update city successfully', async () => {
      mockCreateUpdateCityValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      mockBaseRepository.updateById.mockResolvedValue({ ...mockUpdatedCity, id: '507f1f77bcf86cd799439011' });

      const result = await updateCity('507f1f77bcf86cd799439011', mockUpdateRequest);

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(CityDTO, '507f1f77bcf86cd799439011', mockValidatedData);
      expect(result).toEqual({
        status: true,
        id: '507f1f77bcf86cd799439011'
      });
    });

    it('should throw error when validation fails', async () => {
      const validationError = new ZodError([]);
      mockCreateUpdateCityValidator.mockReturnValue({
        success: false,
        error: validationError
      } as any);

      await expect(updateCity('507f1f77bcf86cd799439011', mockUpdateRequest)).rejects.toThrow('[]');

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      mockCreateUpdateCityValidator.mockReturnValue({
        success: true,
        data: mockValidatedData
      } as any);
      mockBaseRepository.updateById.mockResolvedValue(null);

      await expect(updateCity('507f1f77bcf86cd799439011', mockUpdateRequest)).rejects.toThrow('Update fail');

      expect(mockCreateUpdateCityValidator).toHaveBeenCalledWith(mockUpdateRequest);
      expect(mockBaseRepository.updateById).toHaveBeenCalledWith(CityDTO, '507f1f77bcf86cd799439011', mockValidatedData);
    });
  });

  describe('softDeleteCity', () => {
    it('should soft delete city successfully', async () => {
      mockIsValidObjectId.mockReturnValue(true);
      mockBaseRepository.softDeleteById.mockResolvedValue(undefined);

      const result = await softDeleteCity('507f1f77bcf86cd799439011');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockBaseRepository.softDeleteById).toHaveBeenCalledWith(CityDTO, '507f1f77bcf86cd799439011');
      expect(result).toEqual({
        status: true
      });
    });

    it('should throw error for invalid id', async () => {
      mockIsValidObjectId.mockReturnValue(false);

      await expect(softDeleteCity('invalid-id')).rejects.toThrow('Invalid city id');

      expect(mockIsValidObjectId).toHaveBeenCalledWith('invalid-id');
      expect(mockBaseRepository.softDeleteById).not.toHaveBeenCalled();
    });
  });
}); 