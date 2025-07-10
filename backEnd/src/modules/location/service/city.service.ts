import { CityDTO, CityModel } from '../data/dtos/city.dto';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { ListRequest } from '../../base/controller/request/list.request';
import {
  CityListResponse,
  CityResponse,
} from '../controller/response/city.response';
import { isValidObjectId } from 'mongoose';
import { CityListRequest, CreateUpdateCityRequest } from '../controller/request/create.city.request';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import { createUpdateCityValidator } from '../validators/city.validator';

// Service For getAll Cities
export const getCities = async (
  listReq: CityListRequest
): Promise<CityListResponse> => {
  const query = { isDeleted: false } as any;
  if (listReq.search) {
    query.$or = {
      name: {
        $regex: '.*' + (listReq.search ? listReq.search : '.*'),
        $options: 'i',
      },
    };
  }
  if(listReq.districtId) query.districtId=listReq.districtId;
  const cities = await BaseRepository.findAll(
    CityDTO,
    query,
    listReq.skip,
    listReq.limit
  );
  return {
    status: true,
    totalCount: cities.totalCount,
    cities: cities.items,
  };
};

// Service for getOne City
export const getCity = async (
  id: string
): Promise<CityResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid city Id');
  const city: CityModel | null = await BaseRepository.findById(
    CityDTO,
    id
  );
  if (!city) throw new Error(`City not found with ${id}`);
  return { status: true, city } as CityResponse;
};

// Service for create City
export const createCity = async (
  cityData: CreateUpdateCityRequest
): Promise<CreatedUpdatedResponse> => {
  const validatedResult = createUpdateCityValidator(cityData);
  if (validatedResult.error) {
    throw new Error(validatedResult.error.toString());
  }
  const cityId: string | null = await BaseRepository.create(
    CityDTO,
    validatedResult.data
  );
  if (cityId == null) throw new Error('Create fail');
  return { status: true, id: cityId } as CreatedUpdatedResponse;
};

// Service for update City
export const updateCity = async (
  id: string,
  cityData: CreateUpdateCityRequest
): Promise<CreatedUpdatedResponse> => {
  const validatedResult = createUpdateCityValidator(cityData);
  if (validatedResult.error) {
    throw new Error(validatedResult.error.toString());
  }
  const city: CityModel | null =
    await BaseRepository.updateById(CityDTO, id, validatedResult.data);
  if (city == null) throw new Error('Update fail');
  return { status: true, id: city.id };
};

// Service for delete City
export const softDeleteCity = async (
  id: string
): Promise<BaseResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid city id');
  await BaseRepository.softDeleteById(CityDTO, id);
  return { status: true };
};
