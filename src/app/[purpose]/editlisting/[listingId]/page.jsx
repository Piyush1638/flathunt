"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams, useRouter } from "next/navigation";

// These are firebase imports //
import {
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "@firebaseConfig";
import { toast } from "react-toastify";

import Loading from "@components/Loading";

const EditListsing = () => {
  const auth = getAuth();
  const params = useParams();
  const router = useRouter();
  const isMounted = useRef(false);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkImageUpdated, setCheckImageUpdated] = useState(false);
  //   const [isFormUpdated, setIsFormUpdated] = useState(false);
  const [formData, setFormData] = useState({
    purpose: "",
    propertyName: "",
    flatType: "",
    seater: 0,
    tennants: "",
    furnished: false,
    furnishedItems: "",
    facilities: "",
    houseBuildingName: "",
    localityName: "",
    pinCode: 0,
    state: "",
    rentAmount: 0,
    brokerage: false,
    brokerageAmount: 0,
    additionalCharges: "",
    depositAmount: "",
    availability: "",
    description: "",
    phoneNumber: 0,
    whatsAppNumber: 0,
    images: [],
  });

  const {
    purpose,
    propertyName,
    flatType,
    seater,
    tennants,
    furnished,
    furnishedItems,
    facilities,
    houseBuildingName,
    localityName,
    pinCode,
    state,
    rentAmount,
    brokerage,
    brokerageAmount,
    additionalCharges,
    depositAmount,
    availability,
    description,
    phoneNumber,
    whatsAppNumber,
    images,
  } = formData; // Destructuring form data

  // Check if user is logged in or not---> In the case when a user tried to access this page directly from url
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({
            ...formData,
            userRef: user.uid,
            listerName: user.displayName,
          });
        } else {
          toast.info("You need to join to create a listing.");
          router.push("/");
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // useEffect to get all the data of that listing
  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(
        db,
        "listings",
        `flatHunt${params.purpose}`,
        params.purpose,
        params.listingId
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        toast.error("Listing doesn't exists!");
        router.push("/");
      }
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (
      auth?.currentUser &&
      listing &&
      listing.userRef !== auth?.currentUser.uid
    ) {
      toast.error("Invalid User! You cant't edit this listing");
      router.push("/");
    }
  });

  // On change handler for create listing form
  const onChangeHandler = (e) => {
    let value = e.target.value;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }
    if (e.target.type === "file") {
      value = e.target.files;
    }

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: value,
    }));
  };

  // updateHandler
  const updateHandler = async (e) => {
    e.preventDefault();

    // Check if any field or images are updated
    const isFormUpdated = JSON.stringify(formData) !== JSON.stringify(listing);
    console.log(isFormUpdated);

    let isImagesUpdated =
      isFormUpdated && formData.images && formData.images.length > 0;

    if (isImagesUpdated) {
      isImagesUpdated = true;
    } else {
      isImagesUpdated = false;
    }

    // If no fields or images are updated, return
    if (!isFormUpdated && !isImagesUpdated) {
      toast.info("No changes made to the listing.");
      return;
    }

    // If more than 6 images are uploaded, return
    if (isImagesUpdated && formData.images.length > 6) {
      toast.error("You can upload maximum 6 images");
      return;
    }

    setCheckImageUpdated(isImagesUpdated);

    try {
      // Show the updating modal
      if (!checkImageUpdated) {
        setShowModal(true);
      }

      // Update the listing fields in the Firestore document
      //   const listingDocRef = doc(
      //     db,
      //     "listings",
      //     `flatHunt${params.purpose}`,
      //     params.purpose,
      //     params.listingId
      //   );

      let listingDocRef;

      // check if purpose is change, if changes then change the listing's subdatabase too

      if (listing.purpose !== formData.purpose) {
        // Delete the document from the previous subcollection
        const prevDocRef = doc(
          db,
          "listings",
          `flatHunt${listing.purpose}`,
          listing.purpose,
          params.listingId
        );

        if (!isImagesUpdated) {
          formData.images = listing.imgUrls;
          isImagesUpdated = true;
        }

        await deleteDoc(prevDocRef);

        // Create a new document in the purpose accordinng subcollection
        listingDocRef = doc(
          db,
          "listings",
          `flatHunt${formData.purpose}`,
          formData.purpose,
          params.listingId
        );
      } else {
        listingDocRef = doc(
          db,
          "listings",
          `flatHunt${params.purpose}`,
          params.purpose,
          params.listingId
        );
      }

      const updateData = { 
        ...formData,
        imgUrls:formData.images,
        updatedAt: serverTimestamp(),
      };

      // Remove the images field if no new images are uploaded
      if (!isImagesUpdated) {
        if(formData.images === listing.imgUrls){
            delete updateData.images
        }else{
            delete updateData.images;
            delete updateData.imgUrls;
        }
      }else{
        delete updateData.images;
        delete updateData.imgUrls;
      }
    

      if (updateData.propertyName !== "Apartment/Flat") {
        delete updateData.flatType;
      }
      if (updateData.propertyName !== "PG") {
        delete updateData.seater;
      }
      if (updateData.furnished === "Not Furnished") {
        delete updateData.furnishedItems;
      }

      // Update the document with the updated data
      /* Here's what happens when you use merge: true:

      If the document exists, the specified fields in the update data will be updated or added, and any existing fields not present in the update data will be preserved.

      If the document doesn't exist, a new document will be created with the specified fields in the update data.*/

      const mergeTrueOrNot = updateData.propertyName === listing.propertyName;

      await setDoc(listingDocRef, updateData, { merge: mergeTrueOrNot });

      // If new images are uploaded, update the images in storage
      if (isImagesUpdated && formData.images !== listing.imgUrls) {
        const storage = getStorage();
        const imagesUrls = [];

        for (let i = 0; i < formData.images.length; i++) {
          const imageFile = formData.images[i];
          const fileName =  `${auth.currentUser.uid}-${imageFile.name}-${uuidv4()}`;
          const imageRef = ref(
            storage,
            `images/${auth.currentUser.uid}/` + fileName
          );
          const uploadTask = uploadBytesResumable(imageRef, imageFile);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Update progress if needed
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgress(progress);
            },
            (error) => {
              // Handle error if needed
              console.error(error);
            },
            async () => {
              // Upload is complete, get the image URL and store it
              const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              imagesUrls.push(imageUrl);

              // Update the document with the new image URLs
              if (imagesUrls.length === formData.images.length) {
                await updateDoc(listingDocRef, { imgUrls: imagesUrls });
                if (showModal) {
                  setShowModal(false);
                } else {
                  setCheckImageUpdated(false);
                }
                toast.success("Listing updated successfully.");
                router.push(
                  `/category/${updateData.purpose}/${params.listingId}`
                );
              }
            }
          );
        }
      } else {
        // No new images are uploaded, only update the document
        if (showModal) {
          setShowModal(false);
        } else {
          setCheckImageUpdated(false);
        }
        toast.success("Listing updated successfully.");
        router.push(`/category/${updateData.purpose}/${params.listingId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the listing.");
      if (showModal) {
        setShowModal(false);
      } else {
        setCheckImageUpdated(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <section className="h-full flex w-full overflow-auto ">
      {checkImageUpdated && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded bg-slate-300 dark:bg-gray-800 sm:w-1/2 w-4/5 shadow-lg p-8">
            <div className="flex justify-center flex-col">
              <progress className="w-full" value={progress} max="100" />
              <p className="font-light text-sm text-gray-400 mt-1">
                {progress} % done.
              </p>
              <p className="flex items-center justify-center mt-3">
                Your Listing is Updating..
              </p>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded bg-slate-300 dark:bg-gray-800 sm:w-1/2 w-4/5 shadow-lg p-8">
            <div
              role="status h-screen"
              className="flex items-center justify-center"
            >
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="flex items-center justify-center mt-3">
              Your Listing is Updating..
            </p>
          </div>
        </div>
      )}
      <div className="glassmorphism m-auto mt-2 sm:w-4/5 w-full rounded">
        <h1 className="text-2xl text-center ">
          <span className="font-extrabold sm:text-xl md:text-2xl lg:text-3xl">
            Update Listing
          </span>
        </h1>

        {/* Form for create listing */}
        <form className="glassmorphism mt-6" onSubmit={updateHandler}>
          {/* Purpose */}
          <div className="flex flex-row">
            <div className="form-check">
              {/* for rent */}
              <input
                type="radio"
                className="me-3"
                value="Rent"
                checked={purpose === "Rent"}
                onChange={onChangeHandler}
                name="purpose"
                // id="purpose"
              />
              <label>
                <span className="form_label">Rent</span>
              </label>
            </div>

            {/* for flatmates */}
            <div className=" ms-3 form-check">
              <input
                type="radio"
                className="me-3"
                value="Flatmates"
                checked={purpose === "Flatmates"}
                onChange={onChangeHandler}
                name="purpose"
                // id="purpose"
              />
              <label>
                <span className="form_label">Flatmates</span>
              </label>
            </div>
          </div>

          {/* Property Type */}
          <div className="flex flex-col mt-4">
            <label className="mb-4" htmlFor="propertyName">
              <span className="form_label">Property Type</span>
            </label>

            <div className="glassmorphism w-full">
              <div>
                {/* PG */}
                <input
                  type="radio"
                  className="me-3"
                  value="PG"
                  checked={propertyName === "PG"}
                  onChange={onChangeHandler}
                  name="propertyName"
                  // id="propertyName"
                />
                <label>
                  <span className="form_label">PG</span>
                </label>
              </div>

              {/* Flats */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Apartment/Flat"
                  checked={propertyName === "Apartment/Flat"}
                  onChange={onChangeHandler}
                  name="propertyName"
                  // id="propertyName"
                />
                <label>
                  <span className="form_label">Apartment/Flat</span>
                </label>
              </div>

              {/* Independent kothi/Home */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Independent Home"
                  checked={propertyName === "Independent Home"}
                  onChange={onChangeHandler}
                  name="propertyName"
                  // id="propertyName"
                />
                <label>
                  <span className="form_label">Independent Home</span>
                </label>
              </div>
            </div>
          </div>

          {/* If the property is of Apartment/flat type */}
          {(propertyName === "Apartment/Flat" ||
            propertyName === "Independent Home") && (
            <div className="mb-3 mt-4">
              <label htmlFor="flatType" className="form_label">
                Flat Type
              </label>
              <select
                value={flatType}
                onChange={onChangeHandler}
                className="ms-3 "
                name="flatType"
                id="flatType"
              >
                <option value="1 RK" name="flatType" id="flatType">
                  1 RK
                </option>
                <option value="1 BHK" name="flatType" id="flatType">
                  1 BHK
                </option>
                <option value="2 BHK" name="flatType" id="flatType">
                  2 BHK
                </option>
                <option value="3 BHK" name="flatType" id="flatType">
                  3 BHK
                </option>
                <option value="3+ BHK" name="flatType" id="flatType">
                  3+ BHK
                </option>
              </select>
            </div>
          )}

          {/* If the property is of PG type */}
          {propertyName === "PG" && (
            <div className="mt-4">
              <label htmlFor="seater">
                <span className="form_label">Seater</span>
                <input
                  type="number"
                  placeholder="E.g. 2, 3 etc."
                  className="form_input"
                  value={seater}
                  id="seater"
                  name="seater"
                  onChange={onChangeHandler}
                  required
                />
              </label>
            </div>
          )}

          {/* Tennants */}
          <div className="flex flex-col mt-4">
            <label className="mb-4" htmlFor="tennants">
              <span className="form_label">Preffered Tennants</span>
            </label>

            <div className="glassmorphism w-full">
              <div>
                {/* Male */}
                <input
                  type="radio"
                  className="me-3"
                  value="Male"
                  checked={tennants === "Male"}
                  onChange={onChangeHandler}
                  name="tennants"
                  // id="tennants"
                />
                <label>
                  <span className="form_label">Male</span>
                </label>
              </div>

              {/* Female */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Female"
                  checked={tennants === "Female"}
                  onChange={onChangeHandler}
                  name="tennants"
                  // id="tennants"
                />
                <label>
                  <span className="form_label">Female</span>
                </label>
              </div>

              {/* Any */}
              {purpose !== "Flatmates" && (
                <div>
                  <input
                    type="radio"
                    className="me-3"
                    value="Any"
                    checked={tennants === "Any"}
                    onChange={onChangeHandler}
                    name="tennants"
                    // id="tennants"
                  />
                  <label>
                    <span className="form_label" htmlFor="Any">
                      Any
                    </span>
                  </label>
                </div>
              )}

              {/* Family */}
              {purpose === "Rent" && (
                <div>
                  <input
                    type="radio"
                    className="me-3"
                    value="Family"
                    checked={tennants === "Family"}
                    onChange={onChangeHandler}
                    name="tennants"
                    // id="tennants"
                  />
                  <label>
                    <span className="form_label">Family</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Types furnished */}
          <div className="flex flex-col mt-4">
            <label className="mb-4" htmlFor="furnished">
              <span className="form_label">Furnished</span>
            </label>

            <div className="glassmorphism w-full">
              <div>
                {/* Fully Furnished */}
                <input
                  type="radio"
                  className="me-3"
                  value="Fully Furnished"
                  checked={furnished === "Fully Furnished"}
                  onChange={onChangeHandler}
                  name="furnished"
                  // id="furnished"
                />
                <label>
                  <span className="form_label">Fully Furnished</span>
                </label>
              </div>

              {/* Semi-furnished */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Semi-furnished"
                  checked={furnished === "Semi-furnished"}
                  onChange={onChangeHandler}
                  name="furnished"
                  // id="furnished"
                />
                <label>
                  <span className="form_label">Semi-furnished</span>
                </label>
              </div>

              {/* Not Furnished */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Not Furnished"
                  checked={furnished === "Not Furnished"}
                  onChange={onChangeHandler}
                  name="furnished"
                  // id="furnished"
                />
                <label>
                  <span className="form_label">Not Furnished</span>
                </label>
              </div>
            </div>
          </div>

          {/* If furnished then available items */}
          {(furnished === "Fully Furnished" ||
            furnished === "Semi-furnished") && (
            <div className="mt-4">
              <label htmlFor="furnishedItems">
                <span className="form_label">Furnished Items</span>
                <textarea
                  type="text"
                  className="form_textarea"
                  value={furnishedItems}
                  onChange={onChangeHandler}
                  name="furnishedItems"
                  placeholder="Sofa, Bed, TV, Fridge, AC, Washing Machine, Geyser, Dining Table, Wardrobe etc."
                  required
                />
              </label>
            </div>
          )}

          {/* Facilities */}
          <div className="mt-4">
            <label htmlFor="facilities">
              <span className="form_label">Facilities</span>
            </label>
            <textarea
              type="text"
              className="form_textarea"
              value={facilities}
              name="facilities"
              id="facilities"
              placeholder="Gated Society, Parking, 24x7 Water Supply, 24x7 Electricity, Near Bus Stand etc."
              onChange={onChangeHandler}
              required
            />
          </div>

          {/* Address */}
          <fieldset className="glassmorphism mt-4">
            <legend className="form_label">Address</legend>
            <div className="mt-4">
              <label htmlFor="houseBuildingName">
                <span className="form_label">House/Building Name</span>
              </label>
              <input
                type="text"
                className="form_input"
                value={houseBuildingName}
                onChange={onChangeHandler}
                // id="houseBuildingName"
                name="houseBuildingName"
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="localityName">
                <span className="form_label">City/Locality/Society Name</span>
              </label>
              <input
                type="text"
                className="form_input"
                value={localityName}
                onChange={onChangeHandler}
                id="localityName"
                name="localityName"
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="pinCode">
                <span className="form_label">Pincode</span>
              </label>
              <input
                type="number"
                className="form_input"
                value={pinCode}
                onChange={onChangeHandler}
                id="pinCode"
                name="pinCode"
                required
              />
            </div>

            <div className="flex sm:flex-row flex-col gap-4  ">
              <div className="mt-4">
                <label htmlFor="state">
                  <span className="form_label">State</span>
                  <input
                    type="text"
                    className="form_input"
                    value={state}
                    onChange={onChangeHandler}
                    id="state"
                    name="state"
                    required
                  />
                </label>
              </div>
            </div>
          </fieldset>

          {/* Rent */}
          <div className="mt-4">
            <label htmlFor="rentAmount">
              <span className="form_label">Rent/Month in Rs.</span>
              <input
                type="number"
                className="form_input"
                value={rentAmount}
                onChange={onChangeHandler}
                name="rentAmount"
                id="rentAmount"
                required
              />
            </label>
          </div>

          {/* Brokerage */}
          <div className="flex flex-col mt-4">
            <label className="mb-4" htmlFor="brokerage">
              <span className="form_label">Brokerage</span>
            </label>

            <div className="glassmorphism w-full">
              <div>
                {/* Yes*/}
                <input
                  type="radio"
                  className="me-3"
                  onChange={onChangeHandler}
                  value={true}
                  checked={brokerage === "true"}
                  name="brokerage"
                  // id="brokerage"
                />
                <label>
                  <span className="form_label">Yes</span>
                </label>
              </div>

              {/* NO */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  onChange={onChangeHandler}
                  value={false}
                  checked={brokerage === "false"}
                  name="brokerage"
                  // id="brokerage"
                />
                <label>
                  <span className="form_label">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Any additional charge */}
          <div className="mt-4">
            <label htmlFor="additionalCharges">
              <span className="form_label">Any additional charges</span>
              <textarea
                type="text"
                className="form_textarea"
                value={additionalCharges}
                name="additionalCharges"
                id="additionalCharges"
                placeholder="Maintenance, Electricity, Water, Gas, Cable, Wifi, etc."
                onChange={onChangeHandler}
                required
              />
            </label>
          </div>

          {/* Deposit */}
          <div className="mt-4">
            <label htmlFor="depositAmount">
              <span className="form_label">Deposit</span>
              <input
                type="text"
                className="form_input"
                value={depositAmount}
                name="depositAmount"
                id="depositAmount"
                onChange={onChangeHandler}
                placeholder="Rent Amount + Other Charges e.g. Brokerage (if any)"
                required
              />
            </label>
          </div>

          {/* Availability */}
          <div className="flex flex-col mt-4">
            <label className="mb-4" htmlFor="availability">
              <span className="form_label">Availability</span>
            </label>

            <div className="glassmorphism w-full">
              <div>
                {/* Immediate */}
                <input
                  type="radio"
                  className="me-3"
                  value="Immediate"
                  checked={availability === "Immediate"}
                  onChange={onChangeHandler}
                  name="availability"
                  // id="availability"
                />
                <label>
                  <span className="form_label">Immediate</span>
                </label>
              </div>

              {/* within 15 Days */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Within 15 Days"
                  checked={availability === "Within 15 Days"}
                  onChange={onChangeHandler}
                  name="availability"
                  // id="availability"
                />
                <label>
                  <span className="form_label">Within 15 Days</span>
                </label>
              </div>

              {/* Within 30 Days */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="Within 30 Days"
                  checked={availability === "Within 30 Days"}
                  onChange={onChangeHandler}
                  name="availability"
                  // id="availability"
                />
                <label>
                  <span className="form_label">Within 30 days</span>
                </label>
              </div>

              {/* After 30 days */}
              <div>
                <input
                  type="radio"
                  className="me-3"
                  value="After 30 Days"
                  checked={availability === "After 30 Days"}
                  onChange={onChangeHandler}
                  name="availability"
                  // id="availability"
                />
                <label>
                  <span className="form_label">After 30 days</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description about Property */}
          <div className="mt-4">
            <label htmlFor="description">
              <span className="form_label">Description Of Property</span>
              <textarea
                type="text"
                className="form_textarea"
                value={description}
                name="description"
                id="description"
                onChange={onChangeHandler}
                required
              />
            </label>
          </div>

          {/* Phone Number */}
          <div className="mt-4">
            <label htmlFor="phoneNumber">
              <span className="form_label">Phone No.</span>
            </label>
            <input
              type="number"
              className="form_input"
              value={phoneNumber}
              onChange={onChangeHandler}
              name="phoneNumber"
              id="phoneNumber"
              pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
              min="0"
            />
          </div>

          {/* Whatsapp Number */}
          <div className="mt-4">
            <label htmlFor="whatsAppNumber">
              <span className="form_label">Whatsapp No.</span>
            </label>
            <input
              type="number"
              className="form_input"
              value={whatsAppNumber}
              onChange={onChangeHandler}
              min="0"
              id="whatsAppNumber"
              name="whatsAppNumber"
              pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
            />
          </div>

          {/* Images */}
          <div className="mt-4">
            <label htmlFor="images">
              <span className="form_label">Images</span>
              <p className="text-sm text-black dark:text-white">
                Maximum 6 images are allowed of type jpg, jpeg, png
              </p>
            </label>
            <input
              type="file"
              name="images"
              accept=".jpg, .png, .jpeg"
              className="form_input"
              max="6"
              multiple
              onChange={onChangeHandler}
              id="images"
            />
            {listing?.imgUrls && listing.imgUrls.length > 0 && (
              <div className="mt-4">
                <p className="form_label">Existing Images:</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1">
                  {listing.imgUrls.map((imageUrl) => (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Existing Image"
                      style={{
                        aspectRatio: "3/2",
                      }}
                      className="existing-image"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="dark:outline_btn black_btn mt-4">
            Update Listing
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditListsing;
