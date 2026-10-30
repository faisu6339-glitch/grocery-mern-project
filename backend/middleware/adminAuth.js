
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function adminAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || !decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("_id email name");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account no longer exists.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token.",
      });
    }

    console.error("Admin authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate administrator.",
    });
  }
}

module.exports = adminAuth;
