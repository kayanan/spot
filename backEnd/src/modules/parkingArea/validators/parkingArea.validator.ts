import { z } from "zod";
import { Types } from "mongoose";

// Base schemas
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

const positiveIntegerSchema = z.number().int().positive();

// Location schema
const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).length(2),
});

// Address schema
const addressSchema = z.object({
  addressLine1: z.string().min(1, "Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid city ID",
  }),
  district: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid district ID",
  }),
  province: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid province ID",
  }),
  postalCode: z.string().optional(),
});

// Create schema
const createParkingAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  longitude: z.string(
    {
      required_error: "Longitude is required",
    }
  ),
  latitude: z.string(
    {
      required_error: "Latitude is required",
    }
  ),
  ownerId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid owner ID",
  }),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email format").optional(),
  images: z.array(z.string().url("Invalid image URL")),
  description: z.string().optional(),
  addressLine1: z.string().min(1, "Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid city ID",
  }),
  district: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid district ID",
  }),
  province: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid province ID",
  }),
  postalCode: z.string().optional(),
  isActive: z.boolean().default(true),
  slot: z.array(z.object({
    type: z.string(),
    count: z.string(),
  })),
});

// Update schema
const updateParkingAreaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  longitude: z.number(
    {
      required_error: "Longitude is required",
    }
  ).optional(),
  latitude: z.number(
    {
      required_error: "Latitude is required",
    }
  ).optional(),
  ownerId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid owner ID",
  }).optional(),
  contactNumber: z.string().min(1, "Contact number is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  description: z.string().min(1, "Description is required").optional(),
  address: addressSchema.optional(),
  isActive: z.boolean().optional(),
  fee: z.number().positive().optional(),
  slot: z.array(z.object({
    type: z.string(),
    count: z.number(),
  })).optional(),
});

// Validation functions
export const validateObjectId = (id: string) => objectIdSchema.parse(id);

export const validateCreateParkingArea = (data: unknown) => {
  return createParkingAreaSchema.safeParse(data);
};

export const validateUpdateParkingArea = (data: unknown) => {
  return updateParkingAreaSchema.safeParse(data);
};

// // Type exports
// export type CreateParkingAreaInput = z.infer<typeof createParkingAreaSchema>;
// export type UpdateParkingAreaInput = z.infer<typeof updateParkingAreaSchema>; 