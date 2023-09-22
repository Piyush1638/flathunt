"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { db } from "@firebaseConfig";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import Loading from "@components/Loading";

// import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
// import { Swiper, SwiperSlide } from "swiper/react";
// import SwiperCore, { Autoplay } from "swiper";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "swiper/css/scrollbar";

import { MdLocationOn } from "react-icons/md";
import {
  BsCalendar2MinusFill,
  BsFillHeartFill,
  BsFillPersonFill,
  BsFillPlusCircleFill,
  BsFillTelephoneFill,
  BsHouseDoorFill,
  BsPersonDashFill,
} from "react-icons/bs";
import { GiSofa } from "react-icons/gi";
import { HiKey } from "react-icons/hi";
import { FaPersonBooth, FaRupeeSign } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import { toast } from "react-toastify";
import SwiperImage from "@components/SwiperImage";

const Listing = () => {
  // SwiperCore.use([Autoplay]);

  const auth = getAuth();
  const router = useRouter();

  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [listing, setListing] = useState({});
  const [checkUser, setCheckUser] = useState(false);

  const [isWishListed, setIsWishListed] = useState(false);
  const userPic =
    "https://openclipart.org/download/247319/abstract-user-flat-3.svg";

  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, "listings",`flatHunt${params.type}`,params.type,params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
      }else{
        setError(true);
      }
      setLoading(false);
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (auth?.currentUser?.uid) {
      checkWishlist();
    }
  }, [auth?.currentUser?.uid]);

  const checkWishlist = async () => {
    try {
      const userWishlistDocRef = doc(db, "users", auth.currentUser.uid);
      const userWishlistDocSnapshot = await getDoc(userWishlistDocRef);

      if (userWishlistDocSnapshot.exists()) {
        const wishlistProperties =
          userWishlistDocSnapshot.data().wishlistProperties;

        const isPropertyInWishlist = wishlistProperties.some(
          (property) => property === params.listingId
        );

        setIsWishListed(isPropertyInWishlist);
      } else {
        setIsWishListed(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addToWishlist = async () => {
    if (auth?.currentUser?.uid) {
      try {
        const userWishlistDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userWishlistDocRef, {
          wishlistProperties: arrayUnion(params.listingId),
        });
        setIsWishListed(true);
        toast.success("Property wishlisted");
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      toast.info("You need to create an account.");
      router.push("/");
    }
  };

  const removeFromWishlist = async () => {
    try {
      const userWishlistDocRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userWishlistDocRef, {
        wishlistProperties: arrayRemove(params.listingId),
      });

      setIsWishListed(false);
      toast.success("Property removed from wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <h1 className="font-bold text-3xl">Listing doesn't exists.</h1>
      </div>
    );
  }

  return (
    <section className="h-full w-full pb-10 overflow-auto scrollbar-hide">
      <div className="flex items-center justify-between p-3 mb-3">
        <Link
          className="listing-hostname"
          href={`/all-listings/${listing.userRef}/${listing.listerName}`}
        >
          <h3 className="flex items-center">
            <img src={userPic} height={30} width={30} alt="User Pic" />
            <span className="ms-3 owner-name">{listing.listerName}</span>
          </h3>
        </Link>
        <button type="button">
          {isWishListed ? (
            <BsFillHeartFill
              onClick={removeFromWishlist}
              className="text-3xl text-red-600"
            />
          ) : (
            <BsFillHeartFill
              onClick={addToWishlist}
              className="text-3xl bg-transparent"
            />
          )}
        </button>
      </div>
      <div className="flex  sm:flex-row flex-col gap-5">
        <div className="sm:w-1/2 h-auto w-full">
          {listing.imgUrls === undefined ? (
            <Loading />
          ) : (
           
            <SwiperImage
              listing={listing}
            />
          )}
        </div>

        <div className="sm:w-1/2 w-full sm:ps-4 sm:pe-4 sm:pb-4 p-2">
          <h4 className="font-bold sm:text-2xl text-xl">
            {listing.purpose === "Rent"
              ? "PROPERTY FOR RENT"
              : "PROPERTY NEEDS A HOMEMATE."}
          </h4>

          <h5 className="font-bold mt-3 flex items-center gap-2">
            {/* <MdLocationOn className="text-3xl" /> */}
            {listing.houseBuildingName},{" "}{listing.localityName},{" "}{listing.state},{" "}
            {listing.pinCode}
          </h5>

          {listing.propertyName === "Apartment/Flat" ? (
            <h4 className="mt-3 sm:text-2xl text-xl font-bold">
              {listing.flatType}{" "}
            </h4>
          ) : (
            listing.propertyName === "PG" && (
            <h4 className="mt-3 text-2xl font-bold">
              {listing.seater} Seater{" "}
            </h4>
            )
          )}

          <h2 className="mt-3 sm:text-2xl text-xl font-bold">
            ₹ {listing.rentAmount} / Month
          </h2>

          <div className="glassmorphism mt-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
              <div className="flex items-center gap-3 my-2">
                <FaRupeeSign className="text-2xl" />
                <div>
                  <h4>₹ {listing.depositAmount}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Deposit Amount
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <FaRupeeSign className="text-2xl" />
                <div>
                  <h4>{listing.additionalCharges}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Additional Charges
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <BsPersonDashFill className="text-2xl" />
                <div>
                  <h4>{listing.brokerage === true ? "YES" : "NO"}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Brokerage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <BsHouseDoorFill className="text-2xl" />
                <div>
                  <h4>{listing.propertyName}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Property Type
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <BsFillPersonFill className="text-2xl" />
                <div>
                  <h4>{listing.tennants}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Preffered Tennants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <HiKey className="text-2xl" />
                <div>
                  <h4>{listing.availability}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-2">
                <BsCalendar2MinusFill className="text-2xl" />
                <div>
                  <h4>
                    {listing.timestamp?.toDate().toLocaleString().slice(0, 9)}
                  </h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Posted On
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-4">
                <GiSofa className="text-2xl" />
                <div>
                  <h4>{listing.furnished}</h4>
                  <p className="dark:text-slate-300 text-slate-700 text-xs">
                    Furnished
                  </p>
                </div>
              </div>
            </div>

              {listing.furnished !== "Not Furnished" && (
                <div className="flex items-center gap-3 my-4">
                  <BsFillPlusCircleFill className="text-2xl" />
                  <div>
                    <h4>{listing.furnishedItems}</h4>
                    <p className="dark:text-slate-300 text-slate-700 text-xs">
                      Amenities
                    </p>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-3 my-2">
             <FaPersonBooth className="text-2xl"/>
             <div>
              <h4>{listing.facilities}</h4>
              <p className="dark:text-slate-300 text-slate-700 text-xs">
                Facilities
              </p>
             </div>
             </div>

            <button
              onClick={() => {
                if (auth?.currentUser) {
                  setCheckUser(true);
                } else {
                  toast.info("You need to join first");
                }
              }}
              type="button"
              className="inline-block rounded bg-success px-6 pb-2 pt-2.5 text-xs font-medium mt-4 uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#14a44d] transition duration-150 ease-in-out hover:bg-success-600 hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:bg-success-600 focus:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:outline-none focus:ring-0 active:bg-success-700 active:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(20,164,77,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)]"
            >
              Contact Lister
            </button>

            {checkUser && (
              <div className="flex items-center gap-4 mt-4">
                <div className="bg-info flex items-center py-3 px-4 rounded-xl text-white">
                  <BsFillTelephoneFill className="text-2xl me-3" />{" "}
                  {listing.phoneNumber}
                </div>
                <Link
                  href={`https://wa.me/${listing.whatsAppNumber}`}
                  className="bg-green-700 flex items-center py-3 px-4 rounded-xl text-white"
                >
                  <RiWhatsappFill className="text-2xl me-3 text-white" />{" "}
                  Whatsapp
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
        <div>
          <h2 className="my-6 text-3xl font-bold">Description</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi,
            voluptates, a quae maiores, voluptatibus laborum optio consectetur
            voluptate vero cum exercitationem aperiam. Reprehenderit minus
            repellendus officia quisquam quis maiores. Corrupti, deserunt alias
            assumenda ut, quae hic labore, vero similique ea vitae tenetur ipsam
            sint! Velit vel illo ex sit aliquam facilis dicta sunt
            exercitationem enim unde, amet rerum. Accusantium dolor voluptatum
            eligendi perspiciatis numquam, mollitia vitae! Omnis ullam
            recusandae, hic totam officiis dolorum placeat pariatur deserunt
            suscipit iste id provident harum, quos sit excepturi, dolore error
            magnam laborum nulla adipisci. Qui sequi repellat quos nihil itaque
            consequuntur facere est corrupti.
          </p>
        </div>
    </section>
  );
};

export default Listing;
