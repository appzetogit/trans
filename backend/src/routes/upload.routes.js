const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/upload.controller");
const { authRequired } = require("../middleware/auth.middleware");

const router = express.Router();

function fileFilter(req, file, cb) {
  const type = String(file.mimetype || "").toLowerCase();
  const ok = type.startsWith("image/") || type === "application/pdf";
  if (!ok) {
    const err = new Error("Unsupported file type. Only images and PDF are allowed.");
    err.statusCode = 400;
    return cb(err);
  }
  return cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter,
});

router.post("/single", authRequired, upload.single("file"), uploadController.uploadSingle);

module.exports = router;

