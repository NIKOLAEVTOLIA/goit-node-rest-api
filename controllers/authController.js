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
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "../nodemailer/nodemailer.js";

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
      const verificationToken = uuidv4();

      const newUser = await User.create({
        email,
        password: hashedPassword,
        avatarURL,
        verificationToken,
      });

      await sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification",
        html: `<a href="${process.env.BASE_URL}/api/users/verify/${verificationToken}">Verify your email</a>`,
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

      if (!user.verify) {
        throw HttpError(401, "Email not verified");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      await User.findByIdAndUpdate(user._id, { token });

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

export const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    await User.findByIdAndUpdate(userId, { token: null });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

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

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        verify: true,
        verificationToken: null,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Verification successful",
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerifEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw HttpError(400, "Missing required field email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verificationToken = uuidv4();
    await User.findByIdAndUpdate(
      user._id,
      { verificationToken },
      { new: true }
    );

    await sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<a href="${process.env.BASE_URL}/api/users/verify/${verificationToken}">Verify your email</a>`,
    });

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (err) {
    next(err);
  }
};
