import { Router } from "express";
import {
  getRole,
  createRole,
  updateRole,
  softDelete,
  getRoles,
} from "../../../controller/role.controller";
import { checkAdmin, checkToken } from "@/src/middlewares/check-auth";

const roleAdminRouter: Router = Router();

roleAdminRouter.get("/", getRoles);
//roleAdminRouter.get('/:id', checkToken, checkAdmin, getRole);
roleAdminRouter.get("/:id", getRole);
roleAdminRouter.post("/", createRole);
roleAdminRouter.put("/:id", updateRole);
roleAdminRouter.delete("/:id", softDelete);

export default roleAdminRouter;
