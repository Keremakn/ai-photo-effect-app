const rateLimit = require("express-rate-limit");
const env = require("../config/env");

function createLimiter({ max, message }) {
  return rateLimit({
    windowMs: env.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
}

const apiLimiter = createLimiter({
  max: env.rateLimit.max,
  message: "Too many requests. Please try again later.",
});

const generateLimiter = createLimiter({
  max: env.rateLimit.generateMax,
  message: "Too many generate requests. Please try again later.",
});

const loginLimiter = createLimiter({
  max: env.rateLimit.loginMax,
  message: "Too many login attempts. Please try again later.",
});

module.exports = {
  apiLimiter,
  generateLimiter,
  loginLimiter,
};
