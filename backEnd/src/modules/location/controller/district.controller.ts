import { Request, Response } from 'express';
import {
  getDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  softDeleteDistrict,
  getDistrictsByProvinceIdService,
} from '../service/district.service';
import { ListRequest } from '../../base/controller/request/list.request';
import {
  DistrictListResponse,
  DistrictResponse,
} from '../controller/response/district.response';
import { CreateUpdateDistrictRequest, DistrictListRequest } from '../controller/request/create.district.request';
import { BaseResponse, CreatedUpdatedResponse } from '../../base/controller/responses/base.repsonse';

// Controller for getting all districts
export const getAllDistricts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const listRequest: DistrictListRequest = {
      provinceId: req.query?.provinceId as string || "",
      search: req.query?.search as string || "",
      skip: Number(req.query?.skip) || 0,
      limit: Number(req.query?.limit) || 10,
    };
    const result: DistrictListResponse = await getDistricts(listRequest);
     res.status(200).json(result);
  } catch (error:any) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Controller for getting a single district
export const getOneDistrict = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result: DistrictResponse = await getDistrict(id);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(404).json({ status: false, message: error.message });
  }
};

// Controller for creating a district
export const createOneDistrict = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const districtData: CreateUpdateDistrictRequest = req.body;
    const result: CreatedUpdatedResponse = await createDistrict(districtData);
     res.status(201).json(result);
  } catch (error:any) {
    console.log(error)
     res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for updating a district
export const updateOneDistrict = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const districtData: CreateUpdateDistrictRequest = req.body;
    const result: CreatedUpdatedResponse = await updateDistrict(id, districtData);
     res.status(200).json(result);
  } catch (error:any) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for deleting a district (soft delete)
export const deleteOneDistrict = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result: BaseResponse = await softDeleteDistrict(id);
     res.status(200).json(result);
  } catch (error:any) {
     res.status(400).json({ status: false, message: error.message });
  }
};

export const getDistrictsByProvinceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { provinceId } = req.params;
    const result: DistrictListResponse = await getDistrictsByProvinceIdService(provinceId);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(400).json({ status: false, message: error.message });
  }
};