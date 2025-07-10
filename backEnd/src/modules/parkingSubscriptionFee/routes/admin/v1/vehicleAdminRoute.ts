import { RequestHandler, Router } from "express";
import { createVehicle, deleteVehicle, getVehicleById,getVehicleTypes, updateVehicle } from "../../../controller/vehicle.controller";

const router = Router();

router.post("/", createVehicle as RequestHandler)
router.get("/:id", getVehicleById as RequestHandler);
router.patch("/:id", updateVehicle as RequestHandler);
router.delete("/:id", deleteVehicle as RequestHandler);
router.get("/types", getVehicleTypes as RequestHandler);

export default router;
