import express from "express";
import {
  register,
  login,
  logout,
  current,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/current", current);

export default authRouter;
