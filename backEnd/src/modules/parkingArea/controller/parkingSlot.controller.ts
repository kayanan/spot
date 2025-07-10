import { Request, Response } from "express";
import { ParkingSlotModel } from "../data/dtos/parkingSlot.dto";
import {
  createSlot,
  updateSlot,
  deleteSlot,
  getSlotById,
  getAllSlots,
  getActiveSlots,
  getSlotsByParkingArea,
  deleteManySlots,
  updateSlotByParkingAreaId,
} from "../service/parkingSlot.service";
import { CreateUpdateParkingSlotRequest } from "./request/create.parkingSlot.request";
import { ParkingSlotValidator } from "../validators/parkingSlot.validator";
import { getNearestParkingSpots } from "../service/parkingArea.service";

export const createSlotHandler = async (req: Request, res: Response) => {
  try {
    const slotData = req.body as [{ slotDetails: Partial<CreateUpdateParkingSlotRequest>, count: number, parkingAreaId: string }];
    const { error } = ParkingSlotValidator.createSlotValidator(slotData);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const slot = await createSlot(slotData);
    res.status(201).json(slot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateSlotHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slotData = req.body as CreateUpdateParkingSlotRequest & { vehicleId: string };
    const slot = await updateSlot(id, slotData);
    res.status(200).json(slot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateSlotByParkingAreaIdHandler = async (req: Request, res: Response) => {
  try {
    const { id: parkingAreaId } = req.params;
    const slotData = req.body as CreateUpdateParkingSlotRequest & { vehicleId: string };
    const slot = await updateSlotByParkingAreaId(parkingAreaId, slotData);
    res.status(200).json(slot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    } else {
      console.log(error); 
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteSlotHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteSlot(id);
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getSlotByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await getSlotById(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.status(200).json(slot);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getAllSlotsHandler = async (req: Request, res: Response) => {
  try {
    const slots = await getAllSlots();
    res.status(200).json(slots);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getActiveSlotsHandler = async (req: Request, res: Response) => {
  try {
    const slots = await getActiveSlots();
    res.status(200).json(slots);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getSlotsByParkingAreaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slots = await getSlotsByParkingArea(id);
    res.status(200).json(slots);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}; 

export const deleteManySlotsHandler = async (req: Request, res: Response) => {
  try {
    const { parkingAreaId } = req.params;
    await deleteManySlots(parkingAreaId);
    res.status(200).json({ message: "Slots deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};


