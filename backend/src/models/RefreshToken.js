const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    createdByIp: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);

