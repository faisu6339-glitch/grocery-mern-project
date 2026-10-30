
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "customer" || !decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Customer access only.",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

module.exports = requireAuth;
