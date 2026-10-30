
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth");
const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend/.env");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in. Please try again.",
    });
  }
});

// Test admin routes
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes are working!",
  });
});



router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const allowedRanges = [7, 30, 90];

    const requestedDays = Number(req.query.days || 7);
    const days = allowedRanges.includes(requestedDays)
      ? requestedDays
      : 7;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const activeOrderFilter = {
      status: { $ne: "cancelled" },
    };

    const periodFilter = {
      ...activeOrderFilter,
      createdAt: { $gte: startDate, $lte: now },
    };

    const previousPeriodFilter = {
      ...activeOrderFilter,
      createdAt: {
        $gte: previousStartDate,
        $lt: startDate,
      },
    };

    const paidRevenueFilter = {
      ...periodFilter,
      paymentStatus: "paid",
    };

    const [
      totalProducts,
      totalCustomers,
      lowStockProducts,
      outOfStockProducts,
      inventoryValue,
      totalOrders,
      previousOrders,
      paidRevenue,
      previousPaidRevenue,
      deliveredOrders,
      orderStatusCounts,
      productSales,
      dailySales,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ stock: 0 }),

      Product.aggregate([
        {
          $group: {
            _id: null,
            value: {
              $sum: { $multiply: ["$price", "$stock"] },
            },
            units: { $sum: "$stock" },
          },
        },
      ]),

      Order.countDocuments(periodFilter),
      Order.countDocuments(previousPeriodFilter),

      Order.aggregate([
        { $match: paidRevenueFilter },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            ...previousPeriodFilter,
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
          },
        },
      ]),

      Order.countDocuments({
        ...periodFilter,
        status: "delivered",
      }),

      Order.aggregate([
        { $match: periodFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        { $match: periodFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            unitsSold: { $sum: "$items.quantity" },
            orderItemValue: { $sum: "$items.subtotal" },
          },
        },
      ]),

      Order.aggregate([
        { $match: periodFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            orderValue: { $sum: "$totalAmount" },
            paidRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "paid"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.find(periodFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          "orderId customerId items totalAmount paymentMethod paymentStatus status createdAt"
        )
        .populate("customer", "name email"),

      Order.aggregate([
        { $match: periodFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            unitsSold: { $sum: "$items.quantity" },
            salesValue: { $sum: "$items.subtotal" },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const revenue = paidRevenue[0]?.revenue || 0;
    const previousRevenue = previousPaidRevenue[0]?.revenue || 0;
    const totalUnitsSold = productSales[0]?.unitsSold || 0;

    const changePercent = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }

      return Number(
        (((current - previous) / previous) * 100).toFixed(1)
      );
    };

    const statusSummary = {
      placed: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const item of orderStatusCounts) {
      statusSummary[item._id] = item.count;
    }

    const dailyMap = new Map(
      dailySales.map((item) => [item._id, item])
    );

    const chart = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const record = dailyMap.get(key);

      chart.push({
        date: key,
        orderValue: record?.orderValue || 0,
        revenue: record?.paidRevenue || 0,
        orders: record?.orders || 0,
      });
    }

    return res.status(200).json({
      success: true,
      generatedAt: now,
      range: {
        days,
        startDate,
        endDate: now,
      },
      metrics: {
        totalProducts,
        totalCustomers,
        totalOrders,
        previousOrders,
        orderChangePercent: changePercent(
          totalOrders,
          previousOrders
        ),

        revenue,
        previousRevenue,
        revenueChangePercent: changePercent(
          revenue,
          previousRevenue
        ),

        totalUnitsSold,
        deliveredOrders,

        // This is inventory at listed selling price, not cost valuation.
        inventoryRetailValue: inventoryValue[0]?.value || 0,
        stockUnits: inventoryValue[0]?.units || 0,
        lowStockProducts,
        outOfStockProducts,

        // Do not claim expenses or net profit without actual cost records.
        expenses: null,
        netProfit: null,
      },
      ordersByStatus: statusSummary,
      chart,
      topProducts,
      recentOrders: recentOrders.map((order) => ({
        orderId: order.orderId,
        customer:
          order.customer?.name || order.shippingAddress?.fullName || "Customer",
        email: order.customer?.email || null,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        createdAt: order.createdAt,
      })),
      inventory: {
        lowStock: await Product.find({
          stock: { $gt: 0, $lte: 5 },
        })
          .select("productId name stock price")
          .sort({ stock: 1 })
          .limit(10)
          .lean(),

        outOfStock: await Product.find({ stock: 0 })
          .select("productId name stock price")
          .limit(10)
          .lean(),
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
});

module.exports = router;
