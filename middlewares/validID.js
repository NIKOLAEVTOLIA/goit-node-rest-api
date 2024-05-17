import mongoose from "mongoose";
import HttpError from "../helpers/HttpError.js";

const validID = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(HttpError(400, "Invalid ID"));
  }
  next();
};

export default validID;
