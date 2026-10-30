
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first."
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("An admin account already exists for this email.");
      return;
    }

    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await Admin.create({
      name: process.env.ADMIN_NAME || "Store Administrator",
      email,
      password: passwordHash,
      role: "admin",
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Could not create admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
