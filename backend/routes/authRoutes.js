
const express = require("express");

const {
  register,
  login,
  me,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/authController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

// Authenticated profile
router.put("/profile", requireAuth, updateProfile);

// Authenticated saved addresses
router.post("/addresses", requireAuth, addAddress);
router.put("/addresses/:addressId", requireAuth, updateAddress);
router.delete("/addresses/:addressId", requireAuth, deleteAddress);
router.patch(
  "/addresses/:addressId/default",
  requireAuth,
  setDefaultAddress
);

module.exports = router;
