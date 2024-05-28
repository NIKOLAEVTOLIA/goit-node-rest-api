import express from "express";
import {
  register,
  login,
  logout,
  current,
} from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/current", authenticate, current);

export default authRouter;
