import jwt from "jsonwebtoken";
import User from "../schemas/userModel.js";
import HttpError from "../helpers/HttpError.js";

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  console.log("Authorization Header:", authorization);

  const [bearer, token] = authorization.split(" ");
  console.log("Bearer:", bearer);
  console.log("Token:", token);

  if (bearer !== "Bearer") {
    console.log("Bearer prefix is missing.");
    return next(HttpError(401, "Not authorized"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);

    const { id } = decodedToken;
    console.log("User ID:", id);

    const user = await User.findById(id);
    console.log("User found:", user);

    if (!user) {
      console.log("User not found.");
      return next(HttpError(401, "Not authorized"));
    }

    if (!user.token || user.token !== token) {
      console.log("User not authorized. Token mismatch.");
      return next(HttpError(401, "Not authorized"));
    }

    req.user = { _id: user._id, email: user.email };
    console.log("User set in request:", req.user);

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next(HttpError(401, "Not authorized"));
  }
};

export default authenticate;
