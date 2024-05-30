import express from "express";
import {
  register,
  login,
  logout,
  current,
  updateAvatar,
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

export default authRouter;
