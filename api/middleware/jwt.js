import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  let token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]; // Cek token di cookies atau header

  if (!token) {
    return next(createError(401, "You are not authenticated!")); // Jika token tidak ada, return 401 Unauthorized
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(createError(403, "Token is not valid!")); // Jika token tidak valid, return 403 Forbidden
    }

    // Pastikan payload ada dan memiliki ID dan role
    if (!payload || !payload.id || !payload.role) {
      return next(createError(403, "Invalid token payload!")); // Jika payload tidak sesuai, return error
    }

    // Set user data dalam request
    req.userId = payload.id;
    req.isSeller = payload.isSeller || false; // Default ke false jika tidak ada
    req.role = payload.role;

    next();
  });
};
