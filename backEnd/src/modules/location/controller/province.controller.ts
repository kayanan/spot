import { Request, Response } from 'express';
import {
  getProvinces,
  getProvince,
  createProvince,
  updateProvince,
  softDelete,
} from '../service/province.service';
import { ListRequest } from '../../base/controller/request/list.request';
import { ProvinceRequest } from '../controller/request/create.province';

// Controller for getting all provinces
export const getAllProvinces = async (req: Request, res: Response) => {
  try {
    const listReq: ListRequest = req.body;
    const result = await getProvinces(listReq);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Controller for getting a single province
export const getSingleProvince = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getProvince(id);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for creating a province
export const createNewProvince = async (req: Request, res: Response) => {
  try {
    const provinceData: ProvinceRequest = req.body;
    const result = await createProvince(provinceData);
    res.status(201).json(result);
  } catch (error:any) {
    console.log(error)
    res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for updating a province
export const updateExistingProvince = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provinceData: ProvinceRequest = req.body;
    const result = await updateProvince(id, provinceData);
    res.status(200).json(result);
  } catch (error:any) {
    console.log(error)
    res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for soft deleting a province
export const deleteProvince = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await softDelete(id);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(400).json({ status: false, message: error.message });
  }
};
