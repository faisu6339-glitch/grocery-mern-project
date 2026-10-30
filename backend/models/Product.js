
const mongoose = require("mongoose");
const ProductCounter = require("./ProductCounter");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
  type: String,
  required: true,
  trim: true,
  index: true,
},
    brand: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    image: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Automatically generate a unique product ID
productSchema.pre("validate", async function () {
  if (!this.isNew || this.productId) {
    return;
  }

  const counter = await ProductCounter.findOneAndUpdate(
    { _id: "productId" },
    { $inc: { seq: 1 } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  this.productId = `ELEC-${String(counter.seq).padStart(4, "0")}`;
});

module.exports = mongoose.model("Product", productSchema);
