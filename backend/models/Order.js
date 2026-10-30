
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function () {
  if (this.isNew && !this.orderId) {
    this.orderId = `ORD-${new mongoose.Types.ObjectId()
      .toString()
      .slice(-10)
      .toUpperCase()}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
