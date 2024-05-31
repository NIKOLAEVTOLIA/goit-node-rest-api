import express from "express";
import {
  register,
  login,
  logout,
  current,
  updateAvatar,
  verifyEmail,
  resendVerifEmail,
} from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";
import { uploadAvatar } from "../middlewares/uploadAvatar.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/current", authenticate, current);
authRouter.patch(
  "/avatars",
  authenticate,
  uploadAvatar.single("avatar"),
  updateAvatar
);
authRouter.get("/verify/:verificationToken", verifyEmail);
authRouter.post("/verify", resendVerifEmail);

export default authRouter;
