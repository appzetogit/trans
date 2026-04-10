const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/uploads", require("./src/routes/upload.routes"));
app.use("/api/admin/auth", require("./src/routes/admin.auth.routes"));
app.use("/api/admin/users", require("./src/routes/admin.users.routes"));

// basic error handler
app.use(require("./src/middleware/error.middleware").errorMiddleware);

// mongodb connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });