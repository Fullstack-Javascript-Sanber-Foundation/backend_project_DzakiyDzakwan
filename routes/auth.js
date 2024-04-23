import { Router } from "express";
import AuthController from "../app/controllers/AuthController.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;
