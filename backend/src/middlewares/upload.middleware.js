const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { randomUUID } = require("crypto");
const ApiError = require("../utils/ApiError");

const uploadDir = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      cb(new ApiError(400, "Only image uploads are allowed."));
      return;
    }

    cb(null, true);
  },
});

module.exports = upload;
