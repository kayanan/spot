import { DistrictDTO, DistrictModel} from '../data/dtos/district.dto';
import { CityDTO } from '../data/dtos/city.dto';
import districtRepository from '../data/repository/district.repository';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { ListRequest } from '../../base/controller/request/list.request';
import {
  DistrictListResponse,
  DistrictResponse,
} from '../controller/response/district.response';
import mongoose, { isValidObjectId } from 'mongoose';
import { CreateUpdateDistrictRequest, DistrictListRequest } from '../controller/request/create.district.request';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import { createUpdateDistrictValidator } from '../validators/district.validator';

// Service For getAll Districts
export const getDistricts = async (
  listReq: DistrictListRequest
): Promise<DistrictListResponse> => {
  const query = { isDeleted: false } as any;
  if (listReq.search) {
    query.$or = {
      name: {
        $regex: '.*' + (listReq.search ? listReq.search : '.*'),
        $options: 'i',
      },
    };
  }
  if (listReq.provinceId) {
    query.provinceId = listReq.provinceId;
  }

  const districts = await BaseRepository.findAll(
    DistrictDTO,
    query,
    listReq.skip,
    listReq.limit
  );
  return {
    status: true,
    totalCount: districts.totalCount,
    districts: districts.items,
  };
};

// Service for getOne District
export const getDistrict = async (
  id: string
): Promise<DistrictResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid district Id');
  const district: DistrictModel | null = await BaseRepository.findById(
    DistrictDTO,
    id
  );
  if (!district) throw new Error(`District not found with ${id}`);
  return { status: true, district } as DistrictResponse;
};

// Service for create District
export const createDistrict = async (
  districtData: CreateUpdateDistrictRequest
): Promise<CreatedUpdatedResponse> => {
  const validatedResult = createUpdateDistrictValidator(districtData);
  if (validatedResult.error) {
    throw new Error(validatedResult.error.toString());
  }
  const districtId: string | null = await BaseRepository.create(
    DistrictDTO,
    validatedResult.data
  );
  if (districtId == null) throw new Error('Create fail');
  return { status: true, id: districtId } as CreatedUpdatedResponse;
};

// Service for update District
export const updateDistrict = async (
  id: string,
  districtData: CreateUpdateDistrictRequest
): Promise<CreatedUpdatedResponse> => {
  const validatedResult = createUpdateDistrictValidator(districtData);
  if (validatedResult.error) {
    throw new Error(validatedResult.error.toString());
  }
  const district: DistrictModel | null =
    await BaseRepository.updateById(DistrictDTO, id, validatedResult.data);

    if(validatedResult.data.isActive===false){
          await districtRepository.updateMany(CityDTO,{districtId:id},{isActive:false});
         
        }
        if(validatedResult.data.isActive===true){
         await districtRepository.updateMany(CityDTO,{districtId:id},{isActive:true});
          
        }
  if (district == null) throw new Error('Update fail');
  return { status: true, id: district.id };
};

// Service for delete District
export const softDeleteDistrict = async (
  id: string
): Promise<BaseResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid district id');
  await BaseRepository.softDeleteById(DistrictDTO, id);
  return { status: true };
};

// Service for get Districts by Province Id
export const getDistrictsByProvinceIdService = async (
  provinceId: string
): Promise<DistrictListResponse> => {
  if (!isValidObjectId(provinceId)) {
    throw new Error('Invalid province Id');
  }
  
  const query = { 
    isDeleted: {$ne:true},
    provinceId: new mongoose.Types.ObjectId(provinceId) 
  };
  
  const districts = await BaseRepository.findAll(
    DistrictDTO, 
    query, 
    0, 
    10000
  );
  return { 
    status: true, 
    districts: districts.items,
    totalCount: districts.totalCount 
  };
};