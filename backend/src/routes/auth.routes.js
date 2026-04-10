const express = require("express");
const authController = require("../controllers/auth.controller");
const { authRequired, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authRequired, authController.me);

router.post("/set-role", authRequired, authController.setRole);
router.post("/update-profile", authRequired, authController.updateProfile);

// Example role gating if you want later:
// router.get("/admin-only", authRequired, requireRole("admin"), (req, res) => res.json({ ok: true }));

module.exports = router;

