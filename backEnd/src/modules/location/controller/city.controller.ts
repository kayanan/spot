import { Request, Response } from "express";
import {
  getCities,
  getCity,
  createCity,
  updateCity,
  softDeleteCity,
} from "../service/city.service";
import { ListRequest } from "../../base/controller/request/list.request";
import {
  CityListResponse,
  CityResponse,
} from "../controller/response/city.response";
import { CityListRequest, CreateUpdateCityRequest } from "../controller/request/create.city.request";
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from "../../base/controller/responses/base.repsonse";

// Controller for getting all cities
export const getAllCities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const listRequest: CityListRequest = {
      districtId:req.query.districtId  as string|| "",
      search: req.query.search as string,
      skip: Number(req.query.skip) || 0,
      limit: Number(req.query.limit) || 10,
    };
    const result: CityListResponse = await getCities(listRequest);
     res.status(200).json(result);
  } catch (error: any) {
     res.status(500).json({ status: false, message: error.message });
  }
};

// Controller for getting a single city
export const getOneCity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result: CityResponse = await getCity(id);
     res.status(200).json(result);
    
  } catch (error: any) {
     res.status(404).json({ status: false, message: error.message });
    
  }
};

// Controller for creating a city
export const createOneCity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cityData: CreateUpdateCityRequest = req.body;
    const result: CreatedUpdatedResponse = await createCity(cityData);
    res.status(201).json(result);
  } catch (error: any) {
res.status(400).json({ status: false, message: error.message });
console.log(error)
  }
};

// Controller for updating a city
export const updateOneCity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const cityData: CreateUpdateCityRequest = req.body;
    const result: CreatedUpdatedResponse = await updateCity(id, cityData);
     res.status(200).json(result);
  } catch (error: any) {
     res.status(400).json({ status: false, message: error.message });
  }
};

// Controller for deleting a city (soft delete)
export const deleteOneCity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result: BaseResponse = await softDeleteCity(id);
     res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ status: false, message: error.message });
  }
};
