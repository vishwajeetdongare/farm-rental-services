// backend/controllers/package.controller.js
import Package from "../models/package.model.js";
import braintree from "braintree";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";
import multer from "multer";

dotenv.config();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB per image
}).array("equipmentImages", 5); // Allow up to 5 images

export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({
        success: false,
        message: "Multer error: " + err.message,
      });
    } else if (err) {
      return res.status(400).send({
        success: false,
        message: "Image upload failed: " + err.message,
      });
    }
    next();
  });
};

// Create package
export const createPackage = async (req, res) => {
  try {
    const {
      equipmentName,
      equipmentDescription,
      equipmentType,
      dailyRentPrice,
      weeklyRentPrice,
      monthlyRentPrice,
      availableQuantity,
      condition,
      manufacturer,
      modelYear,
      location,
      rentalTerms,
      isAvailable,
    } = req.body;

    // Validate required fields
    if (
      !equipmentName ||
      !equipmentDescription ||
      !equipmentType ||
      !dailyRentPrice ||
      !availableQuantity ||
      !location
    ) {
      return res.status(400).send({
        success: false,
        message: "All required fields must be provided!",
      });
    }

    if (dailyRentPrice < 0 || weeklyRentPrice < 0 || monthlyRentPrice < 0) {
      return res.status(400).send({
        success: false,
        message: "Rental prices cannot be negative!",
      });
    }

    if (availableQuantity < 1) {
      return res.status(400).send({
        success: false,
        message: "Available quantity must be at least 1!",
      });
    }

    // Process uploaded images
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one image is required!",
      });
    }

    const equipmentImages = req.files.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const newPackage = await Package.create({
      userId: req.user.id, // Use the authenticated user's ID from JWT
      equipmentName,
      equipmentDescription,
      equipmentType,
      dailyRentPrice: Number(dailyRentPrice),
      weeklyRentPrice: Number(weeklyRentPrice) || 0,
      monthlyRentPrice: Number(monthlyRentPrice) || 0,
      availableQuantity: Number(availableQuantity),
      condition: condition || "Excellent",
      manufacturer: manufacturer || "",
      modelYear: Number(modelYear) || new Date().getFullYear(),
      location,
      rentalTerms: rentalTerms || "",
      isAvailable: isAvailable === "true" || isAvailable === true,
      equipmentImages,
    });

    if (newPackage) {
      return res.status(201).send({
        success: true,
        message: "Package created successfully",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const packages = await Package.find({
      $or: [
        { equipmentName: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
      ],
      isAvailable: offer,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    if (packages.length > 0) {
      // Transform packages to include Base64 image strings
      const transformedPackages = packages.map((pkg) => {
        const images = pkg.equipmentImages.map((img) => {
          const base64String = img.data.toString("base64");
          return `data:${img.contentType};base64,${base64String}`;
        });
        return {
          ...pkg._doc, // Spread the document properties
          equipmentImages: images, // Replace binary images with Base64 URLs
        };
      });

      return res.status(200).send({
        success: true,
        packages: transformedPackages,
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "No Packages yet",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// Get package data

export const getPackageData = async (req, res) => {
  try {
    const packageData = await Package.findById(req?.params?.id);
    if (!packageData) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    // Transform equipmentImages to Base64 strings
    const images = packageData.equipmentImages.map((img) => {
      const base64String = img.data.toString("base64");
      return `data:${img.contentType};base64,${base64String}`;
    });

    const transformedPackageData = {
      ...packageData._doc,
      equipmentImages: images,
    };

    return res.status(200).send({
      success: true,
      packageData: transformedPackageData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// Update package
export const updatePackage = async (req, res) => {
  try {
    const findPackage = await Package.findById(req.params.id);
    if (!findPackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Package updated successfully!",
      updatedPackage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete package
export const deletePackage = async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req?.params?.id);
    if (!deletedPackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Package Deleted!",
    });
  } catch (error) {
    console.log(error); // Fixed typo 'cnsole' to 'console'
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//payment gateway api
//token
// export const braintreeTokenController = async (req, res) => {
//   try {
//     gateway.clientToken.generate({}, function (err, response) {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.send(response);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
