import { Router } from "express";
import {
  getOneDistrict,
  createOneDistrict,
  updateOneDistrict,
  deleteOneDistrict,
} from "@/modules/location/controller/district.controller";

const router: Router = Router();

// Route for getting a single district by its ID
router.get("/:id", getOneDistrict);

// Route for creating a new district
router.post("/", createOneDistrict);

// Route for updating a district by its ID
router.put("/:id", updateOneDistrict);

// Route for soft deleting a district by its ID
router.delete("/:id", deleteOneDistrict);

export default router;
