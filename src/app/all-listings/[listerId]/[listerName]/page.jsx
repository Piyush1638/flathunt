"use client";

import { useParams } from "next/navigation";
import Loading from "@components/Loading";
import ListingCard from "@components/ListingCard";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@firebaseConfig";

const AllListings = () => {
  const params = useParams();
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        let listings = [];
        const listingsRentDocsRef = collection(
          db,
          "listings",
          "flatHuntRent",
          "Rent"
        );

        const listingsFlatmatesDocsRef = collection(
          db,
          "listings",
          "flatHuntFlatmates",
          "Flatmates"
        );

        const queryRent = query(
          listingsRentDocsRef,
          where("userRef", "==", params.listerId),
          orderBy("timestamp", "desc")
        );

        const queryFlatmates = query(
          listingsFlatmatesDocsRef,
          where("userRef", "==", params.listerId),
          orderBy("timestamp", "desc")
        );

        const querySnapshotFlatmates = await getDocs(queryFlatmates);
        const querySnapshotRent = await getDocs(queryRent);

        if (!querySnapshotRent.empty) {
          querySnapshotRent.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            });
          });
        }
        if (!querySnapshotFlatmates.empty) {
          querySnapshotFlatmates.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            });
          });
        }

        console.log(listings);
        setAllListings(listings);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchAllListings();
  }, []);

  console.log(allListings)

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="min-h-screen max-w-screen p-2">
      {!loading && allListings && allListings.length > 0 ? (
        <h1 className="text-xl sm:font-extrabold font-bold my-3">
          See all listings
        </h1>
      ) : (
        <div className="sm:text-2xl text-xl sm:font-extrabold font-bold my-3 flex items-center justify-center">
          No properties listed
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {!loading &&
          allListings &&
          allListings.length > 0 &&
          allListings.map((allList) => (
            <ListingCard
              key={allList.id}
              id={allList.id}
              listing={allList.data}
              card={true}
              className="col-span-1 sm:col-span-1 md:col-span-2"
            />
          ))}
      </div>
    </section>
  );
};

export default AllListings;
