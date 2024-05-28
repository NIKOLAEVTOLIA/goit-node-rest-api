import mongoose from "mongoose";
import HttpError from "../helpers/HttpError.js";

const validID = (req, res, next) => {
  const { id, contactId } = req.params;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return next(HttpError(400, "Invalid ID"));
  }

  if (contactId && !mongoose.Types.ObjectId.isValid(contactId)) {
    return next(HttpError(400, "Invalid ID"));
  }
  next();
};

export default validID;
