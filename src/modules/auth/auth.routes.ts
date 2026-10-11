import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/signup", validateRequest(authValidation.validateSignup), authController.signup);

export const authRoutes = router;
