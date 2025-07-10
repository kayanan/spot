import { RequestHandler, Router } from "express";
import { createSlotHandler, deleteManySlotsHandler, deleteSlotHandler, getAllSlotsHandler, getActiveSlotsHandler, getSlotByIdHandler, getSlotsByParkingAreaHandler, updateSlotHandler } from "../../../controller/parkingSlot.controller";
const router = Router();

router.post("/", createSlotHandler as RequestHandler);
router.get("/", getAllSlotsHandler as RequestHandler);
router.get("/active", getActiveSlotsHandler as RequestHandler);
router.get("/:id", getSlotByIdHandler as RequestHandler);
router.delete("/", deleteManySlotsHandler as RequestHandler);


export default router;