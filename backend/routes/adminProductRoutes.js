
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const Product = require("../models/Product");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();



// --------------------------------------------------
// 2. IMAGE UPLOAD CONFIGURATION
// --------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WEBP images are allowed."));
  },
});

// Upload image buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "electrostore/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(
            new Error("Cloudinary returned no image URL.")
          );
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// --------------------------------------------------
// 3. HELPER FUNCTIONS
// --------------------------------------------------

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const parseNonNegativeInteger = (value) => {
  const number = Number(value);

  return Number.isInteger(number) && number >= 0
    ? number
    : null;
};

const parsePositivePrice = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0
    ? number
    : null;
};

const calculateDiscount = (price, originalPrice) => {
  if (originalPrice <= price) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
};

// --------------------------------------------------
// 4. GET ALL PRODUCTS
// GET /api/admin/products
// Supports pagination, search and category filtering
// --------------------------------------------------

router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { productId: { $regex: escapedSearch, $options: "i" } },
        { brand: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
});

// --------------------------------------------------
// 5. GET PRODUCT BY ID
// GET /api/admin/products/:id
// --------------------------------------------------

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
});

// --------------------------------------------------
// 6. UPLOAD PRODUCT IMAGE
// POST /api/admin/products/upload-image
// Content-Type: multipart/form-data
// Field name: image
// --------------------------------------------------

router.post(
  "/upload-image",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a product image.",
        });
      }

      if (
        !process.env.CLOUDINARY_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res.status(500).json({
          success: false,
          message: "Cloudinary is not configured on the server.",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      return res.status(200).json({
        success: true,
        message: "Product image uploaded successfully.",
        image: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Image upload error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to upload product image.",
      });
    }
  }
);

// --------------------------------------------------
// 7. CREATE PRODUCT
// POST /api/admin/products
// --------------------------------------------------

router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      brand,
      price,
      originalPrice,
      discount,
      image,
      stock,
      isFeatured,
    } = req.body;

    // Validate required text fields
    const requiredFields = {
      name,
      description,
      category,
      subcategory,
      brand,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`,
        });
      }
    }

    if (
      price === undefined ||
      price === "" ||
      stock === undefined ||
      stock === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and stock are required.",
      });
    }

    const numericPrice = parsePositivePrice(price);
    const numericStock = parseNonNegativeInteger(stock);

    const numericOriginalPrice =
      originalPrice === undefined ||
      originalPrice === "" ||
      originalPrice === null
        ? numericPrice
        : parsePositivePrice(originalPrice);

    if (numericPrice === null) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero.",
      });
    }

    if (numericStock === null) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number.",
      });
    }

    if (
      numericOriginalPrice === null ||
      numericOriginalPrice < numericPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Original price must be at least the selling price.",
      });
    }

    if (image !== undefined && typeof image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Image must be a URL string.",
      });
    }

    if (
      isFeatured !== undefined &&
      typeof isFeatured !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be true or false.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      brand: brand.trim(),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      discount: calculateDiscount(
        numericPrice,
        numericOriginalPrice
      ),
      image: image || "",
      stock: numericStock,
      isFeatured: isFeatured ?? false,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create product.",
    });
  }
});

// --------------------------------------------------
// 8. UPDATE PRODUCT
// PUT /api/admin/products/:id
// --------------------------------------------------

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "category",
      "subcategory",
      "brand",
      "price",
      "originalPrice",
      "image",
      "stock",
      "isFeatured",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    // Validate text fields
    const textFields = [
      "name",
      "description",
      "category",
      "subcategory",
      "brand",
    ];

    for (const field of textFields) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (updates.price !== undefined) {
      const value = parsePositivePrice(updates.price);

      if (value === null) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than zero.",
        });
      }

      updates.price = value;
    }

    if (updates.originalPrice !== undefined) {
      const value = parsePositivePrice(updates.originalPrice);

      if (value === null) {
        return res.status(400).json({
          success: false,
          message: "Original price must be greater than zero.",
        });
      }

      updates.originalPrice = value;
    }

    if (updates.stock !== undefined) {
      const value = parseNonNegativeInteger(updates.stock);

      if (value === null) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative whole number.",
        });
      }

      updates.stock = value;
    }

    if (
      updates.image !== undefined &&
      typeof updates.image !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Image must be a URL string.",
      });
    }

    if (updates.isFeatured !== undefined) {
      if (typeof updates.isFeatured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isFeatured must be true or false.",
        });
      }
    }

    const finalPrice =
      updates.price !== undefined ? updates.price : product.price;

    const finalOriginalPrice =
      updates.originalPrice !== undefined
        ? updates.originalPrice
        : product.originalPrice ?? product.price;

    if (finalOriginalPrice < finalPrice) {
      return res.status(400).json({
        success: false,
        message: "Original price cannot be less than selling price.",
      });
    }

    updates.discount = calculateDiscount(
      finalPrice,
      finalOriginalPrice
    );

    Object.assign(product, updates);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update product.",
    });
  }
});

// --------------------------------------------------
// 9. DELETE PRODUCT
// DELETE /api/admin/products/:id
// --------------------------------------------------

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Keep existing order history intact.
    const Order = require("../models/Order");

    const hasOrderHistory = await Order.exists({
      "items.product": product._id,
    });

    if (hasOrderHistory) {
      return res.status(409).json({
        success: false,
        message:
          "This product appears in existing orders. Update its stock to zero or implement product archiving instead of deleting it.",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
});

// --------------------------------------------------
// 10. MULTER ERROR HANDLER
// Handles invalid image types and oversized uploads
// --------------------------------------------------

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image size must not exceed 5 MB."
        : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    error.message === "Only JPG, PNG and WEBP images are allowed."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
