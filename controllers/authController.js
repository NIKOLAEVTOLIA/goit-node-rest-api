import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schemas/userModel.js";
import { registerSchema, loginSchema } from "../schemas/userSchemas.js";
import HttpError from "../helpers/HttpError.js";
import validateBody from "../helpers/validateBody.js";
import authenticate from "../middlewares/authenticate.js";

export const register = [
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw HttpError(409, "Email in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ email, password: hashedPassword });

      res.status(201).json({
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

export const login = [
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw HttpError(401, "Email or password is wrong");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "6h",
      });
      user.token = token;
      await user.save();

      res.status(200).json({
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

export const logout = [
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId);

      if (!user) {
        throw HttpError(401, "Not authorized");
      }

      user.token = null;
      await user.save();

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
];

export const current = [
  authenticate,
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw HttpError(401, "Not authorized");
      }

      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        throw HttpError(401, "Not authorized");
      }

      res.status(200).json({
        email: user.email,
        subscription: user.subscription,
      });
    } catch (err) {
      next(err);
    }
  },
];
