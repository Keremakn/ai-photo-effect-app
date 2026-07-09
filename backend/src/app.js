const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./modules/auth/auth.routes");
const effectRoutes = require("./modules/effects/effect.routes");
const generationRoutes = require("./modules/generation/generation.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

app.use("/api", apiLimiter);
app.use("/api", authRoutes);
app.use("/api", effectRoutes);
app.use("/api", generationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
