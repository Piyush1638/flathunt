"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { FaArrowAltCircleRight } from "react-icons/fa";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@firebaseConfig";

import PrivateRoute from "@components/PrivateRoute";
import ListingCard from "@components/ListingCard";
import Loading from "@components/Loading";

const Profile = () => {
  const auth = getAuth();
  const router = useRouter();
  const isMounted = useRef(false);
  const [MyListings, setMyListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileDetails, setProfileDetails] = useState({});

  // Check if user is logged in or not---> In the case when a user tried to access this page directly from url

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setProfileDetails({
            name: user.displayName,
            email: user.email,
            userId: user.uid,
            profileUrl: user.photoURL,
          });
        } else {
          router.push("/");
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchUserListing = async () => {
      try {
        if (profileDetails.userId) {
          const listingRef = collection(db, "listings", "flatHuntRent", "Rent");
          const q = query(
            listingRef,
            where("userRef", "==", profileDetails.userId),
            orderBy("timestamp", "desc")
          );
          const querySnapshot = await getDocs(q);
          let listings = [];

          querySnapshot.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            });
          });

          const listingRef2 = collection(
            db,
            "listings",
            "flatHuntFlatmates",
            "Flatmates"
          );
          const q2 = query(
            listingRef2,
            where("userRef", "==", profileDetails.userId),
            orderBy("timestamp", "desc")
          );
          const querySnapshot2 = await getDocs(q2);
          querySnapshot2.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            });
          });
          setMyListings(listings);
          setLoading(false);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchUserListing();
  }, [profileDetails.userId]);

  const logoutHandler = () => {
    auth.signOut();
    toast.success("Logout successful");
    router.push("/");
  };

  const onDelete = async (listingId, purpose) => {
    if (
      window.confirm(
        "Are you sure, you want to delete this listing? It cannot be undone afterwards."
      )
    ) {
      // Delete this property Id from other users wishlist
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("wishlistProperties", "array-contains", listingId)
      );
      const querySnapshot = await getDocs(q);

      // Update each user's wishlistedProperties array
      querySnapshot.forEach(async (doc) => {
        const userRef = doc.ref;

        // Remove the deleted property ID from wishlistedProperties array
        await updateDoc(userRef, {
          wishlistProperties: arrayRemove(listingId),
        });
      });

      await deleteDoc(
        doc(db, "listings", `flatHunt${purpose}`, purpose, listingId)
      );
      const updatedListings = MyListings.filter(
        (listing) => listing.id !== listingId
      );
      setMyListings(updatedListings);
      toast.success("Successfully deleted the listing");
    }
  };

  const onEdit = (listingId, purpose) => {
    router.push(`/${purpose}/editlisting/${listingId}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <PrivateRoute>
      <section className="min-h-screen px-4 py-3 overflow-auto scrollbar">
        <div className="flex justify-between my-3">
          <h1 className="sm:text-2xl text-xl sm:font-extrabold font-bold">
            Profile Details
          </h1>
          <button onClick={logoutHandler} className="red_btn">
            Logout
          </button>
        </div>
        <div className="flex px-5 mt-10 py-5 mb-5 ms-auto me-auto flex-col rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 md:max-w-xl md:flex-row">
          <img
            className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
            src={profileDetails.profileUrl}
            alt="profile-pic"
          />
          <div className="grid grid-cols-1 px-3 ">
            <h5 className="mb-2 mt-3 text-xl font-bold text-neutral-800 font-sans dark:text-neutral-50">
              My Details
            </h5>

            <div className="flex items-center gap-3 my-2">
              <div>
                <h4>{profileDetails.name}</h4>
                <p className="dark:text-slate-300 text-slate-700 text-xs">
                  Name
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div>
                <h4> {profileDetails.email}</h4>
                <p className="dark:text-slate-300 text-slate-700 text-xs">
                  Email
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div>
                <h4>{profileDetails.userId}</h4>
                <p className="dark:text-slate-300 text-slate-700 text-xs">
                  Id
                </p>
              </div>
            </div>
            
            <Link href="/create-listing" className="black_btn  mb-4 text-base ">
              <FaArrowAltCircleRight className="me-3" />
              Create Listing for your property
            </Link>
          </div>
        </div>

        {!loading && MyListings && MyListings.length > 0 ? (
          <h2 className="font-bold text-xl mt-5 mb-4">My Listings</h2>
        ) : (
          <h2 className="font-bold text-xl mt-5 mb-4 text-center">
            You have not created any listings yet
          </h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {!loading &&
            MyListings &&
            MyListings.length > 0 &&
            MyListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                listing={listing.data}
                card={true}
                onDelete={() => onDelete(listing.id, listing.data.purpose)}
                onEdit={() => onEdit(listing.id, listing.data.purpose)}
                className="col-span-1 sm:col-span-1 md:col-span-2"
              />
            ))}
        </div>
      </section>
    </PrivateRoute>
  );
};

export default Profile;
