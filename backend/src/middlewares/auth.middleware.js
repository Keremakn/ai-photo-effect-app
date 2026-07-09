const jwt = require("jsonwebtoken");
const env = require("../config/env");
const authRepository = require("../modules/auth/auth.repository");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

async function resolveUserFromToken(req) {
  const authHeader = req.get("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await authRepository.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "User account not found.");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const user = await resolveUserFromToken(req);

  if (!user) {
    throw new ApiError(401, "Authorization token is required.");
  }

  req.user = user;

  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await resolveUserFromToken(req);
  next();
});

function requireAdmin(req, res, next) {
  if (!req.user) {
    next(new ApiError(401, "Authorization token is required."));
    return;
  }

  if (req.user.role !== "admin") {
    next(new ApiError(403, "Admin authorization is required."));
    return;
  }

  next();
}

module.exports = {
  optionalAuth,
  requireAuth,
  requireAdmin,
};
