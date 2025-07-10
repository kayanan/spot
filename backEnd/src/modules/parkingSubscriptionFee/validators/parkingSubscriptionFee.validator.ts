import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createFeeValidator = (data: any) => {
  console.log(data);
  const schema = z.object({
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
  vehicleType: z.string(),
  below100: z.string().min(0, "Fee values cannot be negative"),
  between100and300: z.string().min(0, "Fee values cannot be negative"),
  between300and500: z.string().min(0, "Fee values cannot be negative"),
  above500: z.string().min(0, "Fee values cannot be negative"),
  createdBy: z.string(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

return schema.safeParse(data);
};


const updateFeeValidator = (data: any) => {
  const schema = z.object({
    startDate: z.string().transform((val) => new Date(val)).optional(),
    endDate: z.string().transform((val) => new Date(val)).optional(),
  vehicleType: z.string(),
  below100: z.string().min(0, "Fee values cannot be negative").optional(),
  between100and300: z.string().min(0, "Fee values cannot be negative").optional(),
  between300and500: z.string().min(0, "Fee values cannot be negative").optional(),
  above500: z.string().min(0, "Fee values cannot be negative").optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}); 

return schema.safeParse(data);
};

export const ParkingSubscriptionFeeValidator = {
  createFeeValidator,
  updateFeeValidator
};