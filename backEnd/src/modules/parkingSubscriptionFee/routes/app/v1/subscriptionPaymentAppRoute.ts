import { Router } from "express";
import { createSubscriptionPaymentController, generateHashController, getSubscriptionPaymentByParkingAreaIdController, notifyPaymentController } from "../../../controller/subscriptionPayment.controller";

const router = Router();
router.post("/", createSubscriptionPaymentController as any);
router.get("/parking-area/:id", getSubscriptionPaymentByParkingAreaIdController);
router.post("/generate-hash", generateHashController);
router.post("/notify-payment", notifyPaymentController);


export default router;