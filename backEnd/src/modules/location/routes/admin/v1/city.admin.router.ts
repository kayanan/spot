import { Router } from "express";
import {
  getOneCity,
  createOneCity,
  updateOneCity,
  deleteOneCity,
} from "@/modules/location/controller/city.controller";

const router: Router = Router();

router.get("/:id", getOneCity);
router.post("/", createOneCity);
router.put("/:id", updateOneCity);
router.delete("/:id", deleteOneCity);

export default router;
