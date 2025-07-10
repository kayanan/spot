import { RequestHandler, Router } from "express";
import { getActiveFeesHandler, getFeeForVehicleHandler, getVehicleTypesHandler } from "../../../controller/parkingSubscriptionFee.controller";

const router = Router();

router.get("/vehicle-types", getVehicleTypesHandler);
router.get("/fee-for-vehicle", getFeeForVehicleHandler as RequestHandler);
router.get("/active", getActiveFeesHandler as RequestHandler);

export default router;


