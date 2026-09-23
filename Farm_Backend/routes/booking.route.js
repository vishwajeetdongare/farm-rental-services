import express, { Router } from "express";
import {
  bookPackage,
  cancelBooking,
  deleteBookingHistory,
  getAllBookings,
  getAllUserBookings,
  getCurrentBookings,
  getUserCurrentBookings,
  getBookingsRequest
} from "../controllers/booking.controller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// book package
router.post("/book-package/:packageId", requireSignIn, bookPackage);

//get all current bookings admin
router.get("/get-currentBookings/:userId", requireSignIn, isAdmin, getCurrentBookings);

//get all bookings admin
router.get("/get-allBookings", requireSignIn, isAdmin, getAllBookings);

//get all current bookings by user id
router.get(
  "/get-UserCurrentBookings/:id",
  requireSignIn,
  getUserCurrentBookings
);

//get all bookings by user id
router.get("/get-allUserBookings/:id", requireSignIn, getAllUserBookings);

// get all bookings request along with the user details who requested it
router.get("/get-booking-requests/:userId", getBookingsRequest)

//delete history of booking
router.delete(
  "/delete-booking-history/:id/:userId",
  requireSignIn,
  deleteBookingHistory
);

//cancle booking by id
router.post("/cancel-booking/:id/:userId", requireSignIn, cancelBooking);

export default router;
