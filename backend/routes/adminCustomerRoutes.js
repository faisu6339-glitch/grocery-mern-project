
const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// GET /api/admin/customers
// Search, paginate, and calculate customer order statistics.
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const search = String(req.query.search || "").trim();

    const filter = { role: "customer" };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { customerId: regex },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("customerId name email phone addresses createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const customerIds = customers.map((customer) => customer._id);

    const orderStats = await Order.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$customer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map(
      orderStats.map((stat) => [String(stat._id), stat])
    );

    const results = customers.map((customer) => {
      const stats = statsMap.get(String(customer._id));

      return {
        ...customer,
        totalOrders: stats?.totalOrders || 0,
        totalSpent: stats?.totalSpent || 0,
        lastOrderDate: stats?.lastOrderDate || null,
      };
    });

    res.json({
      success: true,
      customers: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
});

// GET /api/admin/customers/:id
// Get one customer's details and saved addresses.
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, role: "customer" }
      : { customerId: id, role: "customer" };

    const customer = await User.findOne(query)
      .select("customerId name email phone addresses createdAt")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .select(
        "orderId items subtotal shippingFee totalAmount paymentMethod paymentStatus status createdAt shippingAddress"
      )
      .lean();

    const nonCancelledOrders = orders.filter(
      (order) => order.status !== "cancelled"
    );

    res.json({
      success: true,
      customer: {
        ...customer,
        totalOrders: nonCancelledOrders.length,
        totalSpent: nonCancelledOrders.reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0
        ),
        orders,
      },
    });
  } catch (error) {
    console.error("Admin customer details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer details",
    });
  }
});

module.exports = router;
