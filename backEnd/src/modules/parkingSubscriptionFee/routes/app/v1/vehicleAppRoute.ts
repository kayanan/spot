import { RequestHandler, Router } from "express";
import { getVehicleTypes } from "../../../controller/vehicle.controller";

const router = Router();

router.get("/types", getVehicleTypes as RequestHandler);

export default router;