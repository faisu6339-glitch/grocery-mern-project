
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

const allowedStatuses = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// GET /api/admin/orders
// Get orders with search, status filtering, and pagination.
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = {};

    if (status && status !== "all") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }
      filter.status = status;
    }

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");

      const matchingOrders = [
        { orderId: regex },
        { customerId: regex },
        { "shippingAddress.name": regex },
        { "shippingAddress.email": regex },
        { "shippingAddress.phone": regex },
      ];

      // Also search by a customer's name or email if customer is a reference.
      const User = require("../models/User");
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .select("_id")
        .limit(500)
        .lean();

      if (matchingUsers.length) {
        matchingOrders.push({
          customer: { $in: matchingUsers.map((user) => user._id) },
        });
      }

      filter.$or = matchingOrders;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .populate("items.product", "name productId image")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

// GET /api/admin/orders/:id
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { _id: id }
      : { orderId: id };

    const order = await Order.findOne(query)
      .populate("customer", "name email phone")
      .populate("items.product", "name productId image")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Admin get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { _id: id }
      : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "cancelled" && status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "A cancelled order cannot be reopened from this page",
      });
    }

    if (order.status === "delivered" && status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "A delivered order cannot be moved to another status",
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Admin update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

module.exports = router;
