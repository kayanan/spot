import { Request, Response } from "express";
import { ParkingSubscriptionFeeModel } from "../data/dtos/parkingSubscriptionFee.dto";
import {
  createFee,
  updateFee,
  deleteFee,
  getFeeById,
  getAllFees,
  getActiveFees,
  getFeeForVehicle,
  getVehicleTypes
} from "../service/parkingSubscriptionFee.service";

export const createFeeHandler = async (req: Request, res: Response) => {
  try {
    const feeData = req.body as Omit<ParkingSubscriptionFeeModel, "isDeleted">;
    const fee = await createFee(feeData);
    res.status(201).json(fee);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateFeeHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feeData = req.body as Partial<ParkingSubscriptionFeeModel>;
    const fee = await updateFee(id, feeData);
    res.status(200).json(fee);
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteFeeHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteFee(id);
    res.status(200).json({ message: "Fee deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getFeeByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const fee = await getFeeById(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }
    res.status(200).json(fee);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getAllFeesHandler = async (req: Request, res: Response) => {
  try {
    const fees = await getAllFees();
    res.status(200).json(fees);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getActiveFeesHandler = async (req: Request, res: Response) => {
  try {
    const fees = await getActiveFees();
    res.status(200).json(fees);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getFeeForVehicleHandler = async (req: Request, res: Response) => {
  try {
    const { vehicleType, count } = req.query;
    if (!vehicleType || !count) {
      return res.status(400).json({ message: "Vehicle type and count are required" });
    }
    const fee = await getFeeForVehicle(
      vehicleType as string,
      parseInt(count as string)
    );
    if (!fee) {
      return res.status(404).json({ message: "Fee not found for this vehicle type" });
    }
    res.status(200).json({ fee });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}; 

export const getVehicleTypesHandler = async (req: Request, res: Response) => {
  try {
    const vehicleTypes = await getVehicleTypes();
    res.status(200).json({
      count:vehicleTypes.length,
      vehicleTypes,
      success:true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};