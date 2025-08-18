import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware";
import * as authController from "#api/auth/auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/get-email-verification-link/me", authMiddleware, authController.sendLinkForEmailVerification);
router.get("/verify-email/:token", authMiddleware, authController.verifyEmail);
router.post("/logout", authMiddleware, authController.logout);

export default router;
