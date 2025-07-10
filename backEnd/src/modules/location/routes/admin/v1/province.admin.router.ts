import { Router } from "express";
import {
  getSingleProvince,
  createNewProvince,
  updateExistingProvince,
  deleteProvince,
} from "@/modules/location/controller/province.controller";

const router: Router = Router();

// Route for getting a single province by its ID
router.get("/:id", getSingleProvince);

// Route for creating a new province
router.post("/", createNewProvince);

// Route for updating a province by its ID
router.put("/:id", updateExistingProvince);

// Route for soft deleting a province by its ID
router.delete("/:id", deleteProvince);

export default router;
