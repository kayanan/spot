import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const createSlotValidator = (data: any) => {
  const schema = z.array(z.object({
    slotDescription: z.string().optional(),
    slotImage: z.string().optional(),
    slotPrice: z.number().optional(),
    slotSize: z.number().optional(),
    vehicleType: z.string(),
}));

return schema.safeParse(data);
};


const updateSlotValidator = (data: any) => {
  const schema = z.object({
    parkingAreaId: z.string().optional(),
    slotNumber: z.number().optional(),
    slotType: z.string().optional(),
    slotDescription: z.string().optional(),
    slotPrice: z.number().optional(),
    slotImage: z.string().optional(),
    slotSize: z.number().optional(),
    vehicleType: z.string().optional(),
    reservationId: z.union([z.string(), z.instanceof(mongoose.Types.ObjectId).optional()]).optional(),
    isBooked: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }); 

return schema.safeParse(data);
};

export const ParkingSlotValidator = {
  createSlotValidator,
  updateSlotValidator
};