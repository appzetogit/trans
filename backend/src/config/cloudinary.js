const { v2: cloudinary } = require("cloudinary");
const { requireEnv } = require("./env");

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

module.exports = { cloudinary };

