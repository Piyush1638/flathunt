"use client";
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ListingCard from "@components/ListingCard";
import Loading from "@components/Loading";
import PrivateRoute from "@components/PrivateRoute";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Wishlist = () => {
  const auth = getAuth();
  const router = useRouter();
  const [wishList, setWishList] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);


  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      onAuthStateChanged(auth, (user) => {
        if(!user) {
          toast.info("Join first.");
          router.push("/");
        } 
      });
    }
    // eslint-disable-next-line
  }, []);



  useEffect(() => {
    const fetchUserWishlistProperty = async () => {
      if (auth.currentUser) {
        try {
          const dbRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(dbRef);
          const userWishlistData = docSnap.data();
          console.log(userWishlistData.wishlistProperties);
          const wishlistPropertiesId =
            userWishlistData?.wishlistProperties?.map(
              (property) => property
            );

          const flatmatesData = [];
          const rentData = [];

          // Create an array of promises to query the Firestore database for each ID
          const promises = wishlistPropertiesId?.map(async (id) => {
            // Query the "Flatmates" sub-database
            const flatmatesRef = doc(
              db,
              "listings",
              "flatHuntFlatmates",
              "Flatmates",
              id
            );
            const flatmatesDocSnap = await getDoc(flatmatesRef);
            if (flatmatesDocSnap.exists()) {
              flatmatesData.push({
                id: flatmatesDocSnap.id,
                data: flatmatesDocSnap.data(),
              });
              console.log("found in flatmates", flatmatesDocSnap.data());
              return; // Skip querying the "Rent" sub-database if the ID is found in "Flatmates"
            }

            // Query the "Rent" sub-database
            const rentRef = doc(db, "listings", "flatHuntRent", "Rent", id);
            const rentDocSnap = await getDoc(rentRef);
            if (rentDocSnap.exists()) {
              rentData.push({
                id: rentDocSnap.id,
                data: rentDocSnap.data(),
              });
              console.log("found in rent", rentDocSnap.data());
            }
          });

          // Wait for all promises to resolve
          await Promise.all(promises);
          setWishList([...flatmatesData, ...rentData]);
          setLoading(false);
        } catch (error) {
          console.log(error.message);
        }
      }
    };
    fetchUserWishlistProperty();
  }, []);

  if (loading) {
    return <Loading />;
  }

  console.log(wishList); // Moved console log outside useEffect

  return (
    <section className="min-h-screen max-w-screen p-2">
      {!loading && wishList && wishList.length > 0 ? (
        <h1 className="sm:text-2xl text-xl sm:font-extrabold font-bold my-3">
          My wishlist
        </h1>
      ) : (
        <div className="sm:text-2xl text-xl sm:font-extrabold font-bold my-3 flex items-center justify-center">
          No wishlisted properties found
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {!loading &&
          wishList &&
          wishList.length > 0 &&
          wishList.map((wishlist) => (
            <ListingCard
              key={wishlist.id}
              id={wishlist.id}
              listing={wishlist.data}
              className="col-span-1 sm:col-span-1 md:col-span-2"
            />
          ))}
      </div>
    </section>
  );
};

export default Wishlist;
