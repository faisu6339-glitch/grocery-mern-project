const express = require("express");
const { Readable } = require("stream");

const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");

const router = express.Router();

// Check the credentials against Cloudinary so the UI can show a real connection status.
router.get("/status", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    return res.json({
      success: true,
      connected: result?.status === "ok",
      status: result?.status || "unknown",
    });
  } catch (error) {
    const message =
      error?.error?.message || error?.message || "Could not connect to Cloudinary.";
    const statusCode = error?.error?.http_code || error?.http_code;
    console.error("Cloudinary status check failed:", message, statusCode || "");
    return res.status(503).json({
      success: false,
      connected: false,
      message,
    });
  }
});

// POST /api/cloudinary/upload with multipart/form-data field "image".
router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Attach an image using the multipart field "image".',
    });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "electrostore/products", resource_type: "image" },
        (error, uploaded) => {
          if (error) return reject(error);
          if (!uploaded) {
            return reject(new Error("Cloudinary returned no upload result."));
          }
          resolve(uploaded);
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const message =
      error?.error?.message || error?.message || "Cloudinary upload failed.";
    console.error(
      "Cloudinary upload failed:",
      message,
      error?.error?.http_code || error?.http_code || ""
    );
    return res.status(502).json({
      success: false,
      message,
    });
  }
});

module.exports = router;
