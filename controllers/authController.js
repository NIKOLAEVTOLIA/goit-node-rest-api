import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schemas/userModel.js";
import { registerSchema, loginSchema } from "../schemas/userSchemas.js";
import HttpError from "../helpers/HttpError.js";
import validateBody from "../helpers/validateBody.js";
import gravatar from "gravatar";
import jimp from "jimp";
import path from "path";
import fs from "fs/promises";

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
      const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);
      const newUser = await User.create({
        email,
        password: hashedPassword,
        avatarURL,
      });

      res.status(201).json({
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
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
        expiresIn: "24h",
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

export const updateAvatar = [
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw HttpError(400, "Avatar not found!");
      }

      const { path: tempPath, originalname } = req.file;
      const userId = req.user._id;

      const ext = path.extname(originalname);
      const avatarName = `${userId}${ext}`;
      const avatarPath = path.join("public", "avatars", avatarName);
      const tmpDir = path.join(process.cwd(), "tmp");
      const tmpAvatarPath = path.join(tmpDir, avatarName);

      const image = await jimp.read(tempPath);
      await image.resize(250, 250).writeAsync(tmpAvatarPath);

      await fs.copyFile(tmpAvatarPath, avatarPath);
      await fs.unlink(tmpAvatarPath);

      const avatarURL = `/avatars/${avatarName}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { avatarURL },
        { new: true }
      );

      res.status(200).json({ avatarURL: user.avatarURL });
    } catch (err) {
      next(err);
    }
  },
];
