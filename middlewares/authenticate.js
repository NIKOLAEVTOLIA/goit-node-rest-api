import jwt from "jsonwebtoken";
import User from "../schemas/userModel.js";
import HttpError from "../helpers/HttpError.js";

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    return next(HttpError(401, "Not authorized"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decodedToken;
    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      return next(HttpError(401, "Not authorized"));
    }
    req.user = { _id: user._id };
    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
};

export default authenticate;
