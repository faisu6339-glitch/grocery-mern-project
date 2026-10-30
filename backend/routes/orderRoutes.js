
const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
