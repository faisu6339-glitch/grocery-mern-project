
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{6}$/,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Saved delivery addresses for this user
    addresses: {
      type: [addressSchema],
      default: [],
    },

    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
      immutable: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
