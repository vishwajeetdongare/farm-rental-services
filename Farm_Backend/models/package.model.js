// backend/models/package.model.js
import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },
    equipmentName: {
      type: String,
      required: true,
    },
    equipmentDescription: {
      type: String,
      required: true,
    },
    equipmentType: {
      type: String,
      required: true,
    },
    dailyRentPrice: {
      type: Number,
      required: true,
    },
    weeklyRentPrice: {
      type: Number,
      default: 0,
    },
    monthlyRentPrice: {
      type: Number,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      default: "Excellent",
    },
    manufacturer: {
      type: String,
      default: "",
    },
    modelYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    location: {
      type: String,
      required: true,
    },
    rentalTerms: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    equipmentImages: [
      {
        data: {
          type: Buffer, // Store image as binary data
          required: true,
        },
        contentType: {
          type: String, // e.g., "image/jpeg", "image/png"
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);

export default Package;
