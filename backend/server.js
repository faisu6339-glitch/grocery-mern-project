
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// Import routes after loading environment variables
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const productRoutes = require("./routes/productRoutes");
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");

const cloudinary = require("./config/cloudinary");

const app = express();

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// HEALTH CHECK
// GET /
// --------------------------------------------------

app.get("/", async (req, res) => {
  let cloudinaryStatus = "Disconnected";

  try {
    const result = await cloudinary.api.ping();

    if (result?.status === "ok") {
      cloudinaryStatus = "Connected";
    }
  } catch (error) {
    console.error(
      "Cloudinary connection check failed:",
      error?.error?.message || error?.message || "Unknown error"
    );
  }

  return res.status(200).json({
    success: true,
    message: "ElectroStore backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    cloudinary: cloudinaryStatus,
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

// Customer APIs
app.use("/api/products", productRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Admin APIs
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);

// --------------------------------------------------
// HANDLE UNKNOWN API ROUTES
// --------------------------------------------------

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Internal server error",
  });
});

// --------------------------------------------------
// SERVER CONFIGURATION
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Atlas connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(
        `Customer Products API: http://localhost:${PORT}/api/products`
      );
      console.log(
        `Admin Products API: http://localhost:${PORT}/api/admin/products`
      );
      console.log(
        `Admin Dashboard API: http://localhost:${PORT}/api/admin/dashboard`
      );
    });
  } catch (error) {
    console.error("\n========== STARTUP FAILED ==========");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.reason) {
      console.error("Connection reason:", error.reason);
    }

    console.error("====================================\n");

    process.exit(1);
  }
};

// --------------------------------------------------
// DATABASE CONNECTION EVENTS
// --------------------------------------------------

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

// Start server
startServer();
