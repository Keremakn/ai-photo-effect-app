const jwt = require("jsonwebtoken");
const env = require("../config/env");
const authRepository = require("../modules/auth/auth.repository");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.get("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authorization token is required.");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const admin = await authRepository.findById(payload.sub);

  if (!admin) {
    throw new ApiError(401, "Admin account not found.");
  }

  req.admin = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
  };

  next();
});

function requireAdmin(req, res, next) {
  if (!req.admin) {
    next(new ApiError(401, "Authorization token is required."));
    return;
  }

  if (req.admin.role !== "admin") {
    next(new ApiError(403, "Admin authorization is required."));
    return;
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
