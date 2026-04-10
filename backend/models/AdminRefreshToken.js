const mongoose = require("mongoose");

const AdminRefreshTokenSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    createdByIp: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

AdminRefreshTokenSchema.index({ adminId: 1, expiresAt: 1 });

module.exports = mongoose.model("AdminRefreshToken", AdminRefreshTokenSchema);

