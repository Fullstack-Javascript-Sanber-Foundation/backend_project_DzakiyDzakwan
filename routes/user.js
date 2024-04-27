import { Router } from "express";
import UserController from "../app/controllers/UserController.js";
import auth from "../app/middlewares/AuthMiddleware.js";

const router = Router();
router.use(auth);
router.get("/", UserController.index);
router.get("/:id", UserController.show);
router.post("/", UserController.store);
router.put("/:id/update", UserController.update);
router.delete("/:id/delete", UserController.destroy);

router.get("/:id/roles", UserController.roles);
router.post("/:id/attach-roles", UserController.attachRole);
router.delete("/:id/detach-roles", UserController.detachRole);

router.get("/:id/permissions", UserController.permissions);
router.post("/:id/attach-permissions", UserController.attachPermission);
router.delete("/:id/detach-permissions", UserController.detachPermission);

export default router;
