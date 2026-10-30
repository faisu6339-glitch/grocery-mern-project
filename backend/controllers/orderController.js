
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    // 1. Validate cart
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Only Cash on Delivery is currently supported.",
      });
    }

    // 2. Validate shipping address
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "postalCode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete delivery details.",
      });
    }

    // 3. Validate and combine duplicate product IDs
    const quantities = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity in your cart.",
        });
      }

      const id = item.productId;
      const totalQuantity =
        (quantities.get(id) || 0) + item.quantity;

      if (!Number.isSafeInteger(totalQuantity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity.",
        });
      }

      quantities.set(id, totalQuantity);
    }

    // 4. Get authenticated customer
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found. Please log in again.",
      });
    }

    // 5. Get real products and prices from MongoDB
    const products = await Product.find({
      _id: { $in: [...quantities.keys()] },
    });

    if (products.length !== quantities.size) {
      return res.status(400).json({
        success: false,
        message: "One or more products no longer exist.",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const product of products) {
      const quantity = quantities.get(product._id.toString());

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}.`,
        });
      }

      const itemSubtotal = Math.round(
        product.price * quantity * 100
      ) / 100;

      subtotal = Math.round(
        (subtotal + itemSubtotal) * 100
      ) / 100;

      orderItems.push({
        product: product._id,
        productId: product.productId || product._id.toString(),
        name: product.name,
        image: product.image || "",
        price: product.price,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    // 6. Calculate totals on the server
    const shippingFee = subtotal >= 2000 ? 0 : 99;
    const totalAmount = Math.round(
      (subtotal + shippingFee) * 100
    ) / 100;

    // 7. Create order with customer information
    const order = await Order.create({
      customer: user._id,
      customerId: user.customerId,
      customerName: user.name || shippingAddress.fullName.trim(),
      customerEmail: user.email,
      customerPhone: shippingAddress.phone.trim(),

      items: orderItems,

      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine: shippingAddress.addressLine.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        landmark: shippingAddress.landmark?.trim() || "",
      },

      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      status: "placed",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    // Log the actual reason in the backend terminal
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.id,
      customer: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Fetch order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details.",
    });
  }
};
