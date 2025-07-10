import { RequestHandler, Router } from "express";
import { createFeeHandler, deleteFeeHandler, getAllFeesHandler, getFeeByIdHandler, updateFeeHandler } from "../../../controller/parkingSubscriptionFee.controller";

const router = Router();

router.post("/", createFeeHandler as RequestHandler);
router.get("/", getAllFeesHandler as RequestHandler);
router.get("/:id", getFeeByIdHandler as RequestHandler);
router.patch("/:id", updateFeeHandler as RequestHandler);
router.delete("/:id", deleteFeeHandler as RequestHandler);


export default router;