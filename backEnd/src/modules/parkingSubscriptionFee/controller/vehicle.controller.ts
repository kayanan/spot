import { Request, Response } from "express";
import * as VehicleService from "../service/vehicle.service";


export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
   
    const vehicle = await VehicleService.createVehicle(data);
    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await VehicleService.getVehicles();
    res.status(200).json(vehicles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.id);
    res.status(200).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const vehicle = await VehicleService.updateVehicle(
      req.params.id,
      data
    );
    res.status(200).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    await VehicleService.deleteVehicle(req.params.id);
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await VehicleService.getVehicleTypes();
    res.status(200).json({ vehicleTypes: types });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 