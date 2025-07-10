import { RequestHandler } from "express";
import { deleteReservationHandler } from "../../../controller/reservation.controller";
import { Router } from "express";

const router = Router();

// Delete reservation
router.delete("/:id", deleteReservationHandler as RequestHandler);

export default router;