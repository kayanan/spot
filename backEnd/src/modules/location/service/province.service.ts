import { ProvinceDTO ,ProvinceModel} from '../data/dtos/province.dto';
import { DistrictDTO,DistrictModel} from "../data/dtos/district.dto";
import { CityDTO } from '../data/dtos/city.dto';
import BaseRepository from '@/modules/base/data/repository/base.repository';

import { ListRequest } from '../../base/controller/request/list.request';
import {
  ProvinceListResponse,
  ProvinceResponse
} from '../controller/response/province.response';
import { isValidObjectId } from 'mongoose';
import { ProvinceRequest } from '../controller/request/create.province';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import { createUpdateProvincealidator } from '../validators/province.validator';
import districtRepository from '../data/repository/district.repository';

// Service For getAll Provinces
export const getProvinces = async (
  listReq: ListRequest
): Promise<ProvinceListResponse> => {
  const query = { isDeleted: false } as any;
  if (listReq.search) {
    query.$or = {
      name: {
        $regex: '.*' + (listReq.search ? listReq.search : '.*'),
        $options: 'i',
      },
    };
  }
  const provinces = await BaseRepository.findAll(
    ProvinceDTO,
    query,
    listReq.skip,
    listReq.limit
  );
  return {
    status: true,
    totalCount: provinces.totalCount,
    provinces: provinces.items,
  };
};

//Service for getOne province
export const getProvince = async (
  id: string
): Promise<ProvinceResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid province Id');
  const province: ProvinceModel | null = await BaseRepository.findById(
    ProvinceDTO,
    id
  );
  if (!province) throw new Error(`Province not found with ${id}`);
  return { status: true, province } as ProvinceResponse;
};
//Service for create province
export const createProvince = async (
  provinceData: ProvinceRequest
): Promise<CreatedUpdatedResponse> => {
  
  const validatedResult = createUpdateProvincealidator(provinceData);
 
  if(validatedResult.error){
    throw new Error(validatedResult.error.toString())
  }
  const provinceId: string | null = await BaseRepository.create(
    ProvinceDTO,
    validatedResult.data
  );
  if (provinceId == null) throw new Error('Create fail');
  return { status: true, id: provinceId } as CreatedUpdatedResponse;
};

//Service for update province
export const updateProvince = async (
  id: string,
  provinceData: ProvinceRequest
): Promise<CreatedUpdatedResponse> => {
  const validatedResult = createUpdateProvincealidator(provinceData);
  if(validatedResult.error){
    throw new Error(validatedResult.error.toString())
  }
  const province: ProvinceModel | null =
    await BaseRepository.updateById(ProvinceDTO, id, validatedResult.data);
    if(validatedResult.data.isActive===false){
      const inactiveDistrict=await districtRepository.updateMany(DistrictDTO,{provinceId:id},{isActive:false});
     console.log(inactiveDistrict)
      const filtreData=inactiveDistrict?.map((data:DistrictModel)=>{
        return data._id
      })
      
      const city=await districtRepository.updateMany(CityDTO,{districtId:{$in:filtreData}},{isActive:false});
      
    }
    if(validatedResult.data.isActive===true){
      const activeDistrict=await districtRepository.updateMany(DistrictDTO,{provinceId:id},{isActive:true});
      const filtreData=activeDistrict?.map((data:DistrictModel)=>{
        return data._id
      })
      const city=await districtRepository.updateMany(CityDTO,{districtId:{$in:filtreData}},{isActive:true});
      
    }
  if (province == null) throw new Error('update fail');
  return { status: true, id: province.id };
};
//Serive for delete province

export const softDelete = async (
  id: string
): Promise<BaseResponse> => {
  if (!isValidObjectId(id)) throw new Error('Invalid province id');
  await BaseRepository.softDeleteById(ProvinceDTO, id);
  return { status: true };
};
