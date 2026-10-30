
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Counter model for generating unique customer IDs
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter =
  mongoose.models.CustomerCounter ||
  mongoose.model("CustomerCounter", counterSchema);

// Generate IDs such as CUS-000001
const generateCustomerId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "customerId" },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!counter) {
    throw new Error("Unable to generate customer ID.");
  }

  return `CUS-${String(counter.seq).padStart(6, "0")}`;
};

// Create JWT token
const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: "customer",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Return safe user information
const formatUser = (user) => ({
  _id: user._id,
  customerId: user.customerId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  addresses: user.addresses || [],
  role: user.role,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password of at least 8 characters are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const customerId = await generateCustomerId();

    const user = await User.create({
      customerId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: typeof phone === "string" ? phone.trim() : "",
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email or customer ID already exists. Please retry.",
      });
    }

    console.error("Customer registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register customer.",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Fetch customer profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer profile.",
    });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid name is required.",
      });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({
        success: false,
        message: "Phone must be a string.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    user.name = name.trim();

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

// POST /api/auth/addresses
const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pinCode,
      landmark = "",
    } = req.body || {};

    const requiredFields = [
      fullName,
      phone,
      addressLine,
      city,
      state,
      pinCode,
    ];

    if (
      !requiredFields.every(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields.",
      });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    if (!/^\d{6}$/.test(pinCode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code.",
      });
    }

    if (typeof landmark !== "string") {
      return res.status(400).json({
        success: false,
        message: "Landmark must be a string.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const makeDefault =
      user.addresses.length === 0 || req.body.isDefault === true;

    if (makeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      landmark: landmark.trim(),
      isDefault: makeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save address.",
    });
  }
};

// PUT /api/auth/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pinCode,
      landmark = "",
    } = req.body || {};

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    if (
      ![fullName, phone, addressLine, city, state, pinCode].every(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields.",
      });
    }

    if (
      !/^\d{10}$/.test(phone.trim()) ||
      !/^\d{6}$/.test(pinCode.trim()) ||
      typeof landmark !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone, PIN code, and landmark.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    address.fullName = fullName.trim();
    address.phone = phone.trim();
    address.addressLine = addressLine.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.pinCode = pinCode.trim();
    address.landmark = landmark.trim();

    await user.save();

    return res.json({
      success: true,
      message: "Address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update address.",
    });
  }
};

// DELETE /api/auth/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = address.isDefault;

    user.addresses.pull({ _id: addressId });

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete address.",
    });
  }
};

// PATCH /api/auth/addresses/:addressId/default
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    const selectedAddress = user.addresses.id(addressId);

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    user.addresses.forEach((address) => {
      address.isDefault = address._id.equals(selectedAddress._id);
    });

    await user.save();

    return res.json({
      success: true,
      message: "Default address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Set default address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update default address.",
    });
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
