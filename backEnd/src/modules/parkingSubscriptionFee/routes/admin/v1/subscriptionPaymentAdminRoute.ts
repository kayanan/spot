import { Router } from "express";
import { getSubscriptionPaymentsController, getSubscriptionPaymentByIdController, updateSubscriptionPaymentController, softDeleteSubscriptionPaymentController, deleteSubscriptionPaymentController, generateHashController, notifyPaymentController,} from "../../../controller/subscriptionPayment.controller";

const router = Router();

router.get("/", getSubscriptionPaymentsController);
router.get("/:id", getSubscriptionPaymentByIdController);
router.put("/:id", updateSubscriptionPaymentController);
router.delete("/:id", deleteSubscriptionPaymentController);
router.post("/generate-hash", generateHashController);
router.post("/notify-payment", notifyPaymentController);

export default router;