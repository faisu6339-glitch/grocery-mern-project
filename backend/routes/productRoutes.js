
const express = require("express");
const { Readable } = require("stream");

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");

const router = express.Router();

// ==========================================
// HELPER: ESCAPE CATEGORY REGEX
// ==========================================
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ==========================================
// HELPER: PARSE AND VALIDATE NUMBER
// ==========================================
const parseNumber = (value, fieldName, defaultValue = 0) => {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a valid non-negative number.`);
  }

  return number;
};

// ==========================================
// CREATE PRODUCT + UPLOAD IMAGE
// POST /api/products
// Postman: Body -> form-data
// ==========================================
router.post("/", upload.single("image"), async (req, res) => {
  let uploadedImage = null;

  try {

    // Validate required fields
    const { name, category, subcategory, price } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof subcategory !== "string" ||
      !subcategory.trim() ||
      price === undefined ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category, subcategory, and price are required.",
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a product image.",
      });
    }

    // Validate numeric fields
    const productPrice = parseNumber(price, "Price");
    const originalPrice = parseNumber(
      req.body.originalPrice,
      "Original price"
    );
    const discount = parseNumber(req.body.discount, "Discount");
    const rating = parseNumber(req.body.rating, "Rating");
    const reviews = parseNumber(req.body.reviews, "Reviews");
    const stock = parseNumber(req.body.stock, "Stock");

    if (rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5.",
      });
    }

    if (discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed 100%.",
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "electrostore/products",
          resource_type: "image",
        },
        (error, uploadedResult) => {
          if (error) return reject(error);

          if (!uploadedResult?.secure_url) {
            return reject(
              new Error("Cloudinary image upload failed.")
            );
          }

          resolve(uploadedResult);
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    uploadedImage = result;

    // Save product in MongoDB
    const product = await Product.create({
      name: name.trim(),
      description: req.body.description?.trim() || "",
      category: category.trim(),
      subcategory: subcategory.trim(),
      brand: req.body.brand?.trim() || "",
      price: productPrice,
      originalPrice,
      discount,
      image: result.secure_url,
      rating,
      reviews,
      stock,
      isFeatured:
        req.body.isFeatured === true ||
        req.body.isFeatured === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Product created and image uploaded successfully!",
      product,
    });
  } catch (error) {
    // Delete Cloudinary image if database save fails
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError.message
        );
      }
    }

    console.error("Product upload error:", error.message);

    const isValidationError =
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.message.includes("must be a valid non-negative number");

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : "Failed to create product.",
    });
  }
});

// ==========================================
// GET FEATURED PRODUCTS
// GET /api/products/featured
// For Popular Products section
// ==========================================
router.get("/featured", async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 8, 1),
      50
    );

    const products = await Product.find({
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch featured products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products.",
    });
  }
});

// ==========================================
// GET LIGHTING PRODUCTS
// GET /api/products/lighting
// ==========================================
router.get("/lighting", async (req, res) => {
  try {
    const products = await Product.find({
      category: { $regex: "^lighting$", $options: "i" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch lighting products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lighting products.",
    });
  }
});
// ==========================================
// GET PRODUCTS BY CATEGORY AND SUBCATEGORY
// GET /api/products/category/Lighting/subcategory/LED%20Bulbs
// ==========================================
router.get(
  "/category/:categoryName/subcategory/:subcategoryName",
  async (req, res) => {
    try {
      const { categoryName, subcategoryName } = req.params;

      const products = await Product.find({
        category: {
          $regex: `^${escapeRegex(categoryName.trim())}$`,
          $options: "i",
        },
        subcategory: {
          $regex: `^${escapeRegex(subcategoryName.trim())}$`,
          $options: "i",
        },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        category: categoryName,
        subcategory: subcategoryName,
        count: products.length,
        products,
      });
    } catch (error) {
      console.error("Fetch subcategory products error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch subcategory products.",
      });
    }
  }
);

// ==========================================
// GET PRODUCTS BY ANY CATEGORY
// GET /api/products/category/:categoryName
// Example: /api/products/category/Power%20Tools
// ==========================================
router.get("/category/:categoryName", async (req, res) => {
  try {
    const categoryName = req.params.categoryName.trim();

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const products = await Product.find({
      category: {
        $regex: `^${escapeRegex(categoryName)}$`,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      category: categoryName,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch category products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category products.",
    });
  }
});

// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// Optional: /api/products?limit=8
// ==========================================
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 0, 0),
      100
    );

    let query = Product.find().sort({ createdAt: -1 });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
});

module.exports = router;
