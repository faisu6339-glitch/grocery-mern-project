const cloudinary = require("cloudinary").v2;

const requiredEnv = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  throw new Error(
    `Missing Cloudinary environment variable(s): ${missingEnv.join(", ")}`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
