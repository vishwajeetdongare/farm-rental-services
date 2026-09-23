// frontend/src/components/Package.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaClock,
  FaMapMarkerAlt,
  FaShare,
} from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";

const Package = () => {
  SwiperCore.use([Navigation]);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState({
    equipmentName: "",
    equipmentDescription: "",
    location: "",
    dailyRentPrice: 0,
    weeklyRentPrice: 0,
    monthlyRentPrice: 0,
    availableQuantity: 0,
    condition: "",
    manufacturer: "",
    modelYear: 0,
    rentalTerms: "",
    isAvailable: false,
    equipmentImages: [],
    // Keeping rating fields for compatibility with existing UI
    packageRating: 0,
    packageTotalRatings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratingsData, setRatingsData] = useState({
    rating: 0,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          equipmentName: data?.packageData?.equipmentName,
          equipmentDescription: data?.packageData?.equipmentDescription,
          location: data?.packageData?.location,
          dailyRentPrice: data?.packageData?.dailyRentPrice,
          weeklyRentPrice: data?.packageData?.weeklyRentPrice,
          monthlyRentPrice: data?.packageData?.monthlyRentPrice,
          availableQuantity: data?.packageData?.availableQuantity,
          condition: data?.packageData?.condition,
          manufacturer: data?.packageData?.manufacturer,
          modelYear: data?.packageData?.modelYear,
          rentalTerms: data?.packageData?.rentalTerms,
          isAvailable: data?.packageData?.isAvailable,
          equipmentImages: data?.packageData?.equipmentImages,
          // Default rating fields (since not in schema yet)
          packageRating: 0,
          packageTotalRatings: 0,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to load equipment data");
      setLoading(false);
    }
  };

  const giveRating = async () => {
    checkRatingGiven();
    if (ratingGiven) {
      alert("You already submitted your rating!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "") {
      alert("At least 1 field is required!");
      return;
    }
    if (
      ratingsData.rating === 0 &&
      ratingsData.review === "" &&
      !ratingsData.userRef
    ) {
      alert("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/rating/give-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingsData),
      });
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        alert(data?.message);
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      if (data) {
        setPackageRatings(data);
      } else {
        setPackageRatings("No ratings yet!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkRatingGiven = async () => {
    try {
      const res = await fetch(
        `/api/rating/rating-given/${currentUser?._id}/${params?.id}`
      );
      const data = await res.json();
      setRatingGiven(data?.given);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
    }
  }, [params.id, currentUser]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
    <div className="w-1/2 p-5 bg-white shadow-lg rounded-lg">
      {loading && (
        <p className="text-center font-semibold" id="loading">Loading...</p>
      )}
      {error && (
        <div className="flex flex-col w-full items-center gap-2">
          <p className="text-center text-red-700">Something went wrong!</p>
          <Link className="bg-slate-600 text-white p-3 py-2 rounded-lg w-min" to="/">Back</Link>
        </div>
      )}
      {packageData && !loading && !error && (
        <div className="flex flex-col items-center w-full">
          <Swiper navigation className="w-full">
            {packageData?.equipmentImages.map((imageUrl, i) => (
              <SwiperSlide key={i}>
                <div className="h-[300px] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}></div>
              </SwiperSlide>
            ))}
          </Swiper>
  
          {/* Copy and Back Buttons */}
          <div className="relative w-full flex justify-between mt-2">
            <div className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
              <FaArrowLeft className="text-slate-500" onClick={() => navigate("/")} />
            </div>
            <div className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
              <FaShare
                className="text-slate-500"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            </div>
          </div>
          {copied && <p className="text-sm bg-slate-100 p-1 mt-2">Link copied!</p>}
  
          {/* Package Details */}
          <div className="w-full text-center mt-4">
            <p className="text-2xl font-bold capitalize">{packageData?.equipmentName}</p>
            <p className="text-xl font-semibold my-2 text-green-700 flex items-center justify-center gap-1">
              <FaMapMarkerAlt /> {packageData?.location}
            </p>
            <p className="text-lg">{packageData?.condition}</p>
            <p className="text-lg">Manufacturer: {packageData?.manufacturer || "Not specified"}</p>
            <p className="text-lg">Model Year: {packageData?.modelYear || "Not specified"}</p>
            <p className="text-lg">Rental Terms: {packageData?.rentalTerms || "Not specified"}</p>
          </div>
  
          {/* Price Section */}
          <p className="text-2xl font-semibold my-3">
            {packageData?.isAvailable ? (
              <>
                <span className="line-through text-gray-700">
                  ₹{packageData?.weeklyRentPrice || packageData?.dailyRentPrice * 7}
                </span>
                <span> - ₹{packageData?.dailyRentPrice}</span>
                <span className="text-lg ml-2 bg-green-700 p-1 rounded text-white">
                  {Math.floor(
                    (((packageData?.weeklyRentPrice || packageData?.dailyRentPrice * 7) - packageData?.dailyRentPrice) /
                      (packageData?.weeklyRentPrice || packageData?.dailyRentPrice * 7)) *
                      100
                  )}% Off
                </span>
              </>
            ) : (
              <span>₹{packageData?.dailyRentPrice}</span>
            )}
          </p>
  
          {/* Rating Section */}
          {packageData?.packageTotalRatings > 0 && (
            <div className="flex items-center justify-center gap-2">
              <Rating value={packageData?.packageRating || 0} readOnly precision={0.1} />
              <p>({packageData?.packageTotalRatings})</p>
            </div>
          )}
  
          {/* Description */}
          <div className="text-center mt-2">
            <h4 className="text-xl font-semibold">Description:</h4>
            <p className="text-sm font-medium">
              {packageData?.equipmentDescription.length > 280 ? (
                <>
                  <span id="desc">{packageData?.equipmentDescription.substring(0, 150)}...</span>
                  <button
                    id="moreBtn"
                    onClick={() => {
                      document.getElementById("desc").innerText = packageData?.equipmentDescription;
                      document.getElementById("moreBtn").style.display = "none";
                      document.getElementById("lessBtn").style.display = "flex";
                    }}
                    className="text-gray-600 hover:underline"
                  >
                    More <FaArrowDown />
                  </button>
                  <button
                    id="lessBtn"
                    onClick={() => {
                      document.getElementById("desc").innerText =
                        packageData?.equipmentDescription.substring(0, 150) + "...";
                      document.getElementById("lessBtn").style.display = "none";
                      document.getElementById("moreBtn").style.display = "flex";
                    }}
                    className="hidden text-gray-600 hover:underline"
                  >
                    Less <FaArrowUp />
                  </button>
                </>
              ) : (
                packageData?.equipmentDescription
              )}
            </p>
          </div>
  
          {/* Booking Button */}
          <div className="w-full flex justify-center mt-4">
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  navigate(`/booking/${params?.id}`);
                } else {
                  navigate("/login");
                }
              }}
              className="w-[200px] bg-green-700 text-white rounded p-3 hover:opacity-95"
            >
              Book
            </button>
          </div>
  
          {/* Ratings and Reviews */}
          <div className="w-full flex flex-col items-center mt-5">
            {packageRatings && (
              <>
                <h4 className="text-xl">Rating/Reviews:</h4>
                {!currentUser || ratingGiven ? null : (
                  <div className="w-full sm:max-w-[640px] flex flex-col items-center gap-2">
                    <Rating
                      name="simple-controlled"
                      className="w-max"
                      value={ratingsData?.rating}
                      onChange={(e, newValue) => {
                        setRatingsData({ ...ratingsData, rating: newValue });
                      }}
                    />
                    {/* <textarea
                      className="w-full resize-none p-3 border rounded"
                      rows={3}
                      placeholder="Review"
                      value={ratingsData?.review}
                      onChange={(e) => {
                        setRatingsData({ ...ratingsData, review: e.target.value });
                      }}
                    ></textarea> */}
                    <button
                      disabled={(ratingsData.rating === 0 && ratingsData.review === "") || loading}
                      onClick={giveRating}
                      className=" p-2 bg-green-700 text-white rounded disabled:opacity-80 hover:opacity-95"
                    >
                      {loading ? "Loading..." : "Submit"}
                    </button>
                  </div>
                )}
                <div className="mt-3 w-full grid grid-cols-1 gap-2">
                  <RatingCard packageRatings={packageRatings} />
                  {packageData.packageTotalRatings > 4 && (
                    <button onClick={() => navigate(`/package/ratings/${params?.id}`)} className="text-lg p-2 rounded border hover:bg-slate-500 hover:text-white">
                      View All <FaArrowRight />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  
  );
};

export default Package;
