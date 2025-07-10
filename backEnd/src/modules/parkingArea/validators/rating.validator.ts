import { z } from "zod";
import { Types } from "mongoose";

// Base schemas
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

const ratingSchema = z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5");

// Create schema
const createRatingSchema = z.object({
  reservationId: objectIdSchema,
  userId: objectIdSchema.optional(),
  parkingAreaId: objectIdSchema.optional(),
  rating: ratingSchema,
  comment: z.string().optional(),
});

// Update schema
const updateRatingSchema = z.object({
  rating: ratingSchema.optional(),
  comment: z.string().optional(),
  reservationId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  parkingAreaId: objectIdSchema.optional(),
});

// Validation functions
export const validateObjectId = (id: string) => objectIdSchema.parse(id);

export const validateCreateRating = (data: unknown) => {
  return createRatingSchema.safeParse(data);
};

export const validateUpdateRating = (data: unknown) => {
  return updateRatingSchema.safeParse(data);
};

