import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/signup", validateRequest(authValidation.validateSignup), authController.signup);
router.post("/login", validateRequest(authValidation.validateLogin), authController.login);

export const authRoutes = router;
