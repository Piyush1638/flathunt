"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

// These are firebase imports //
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "@firebaseConfig";
import { toast } from "react-toastify";

const createListing = () => {
  const auth = getAuth();
  const router = useRouter();
  const isMounted = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form data for create listing form
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
    additionalCharges:"",
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

  // On submit handler for create listing form
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(formData);
    if (images.length > 6) {
      toast.info("Maximum 6 images are allowed");
      return;
    }

    // store images to firebase storage
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(
          storage,
          `images/${auth.currentUser.uid}/` + fileName
        );
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
            setShowModal(true);
            console.log("Uploading is " + progress + "% done");
            switch (snapshot.state) {
              case "pause":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Uploading is in progress");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          // success
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      toast.error("Image not uploaded, please try again");
      console.log(error);
      return;
    });

    // saving form data
    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
    };
    delete formDataCopy.images;
    if (formDataCopy.propertyName !== "Apartment/Flat") {
      delete formDataCopy.flatType;
    }
    if (formDataCopy.propertyName !== "PG") {
      delete formDataCopy.seater;
    }
    if (formDataCopy.furnished === "Not Furnished") {
      delete formDataCopy.furnishedItems;
    }

    const docRef = await addDoc(
      collection(
        db,
        "listings",
        `flatHunt${formDataCopy.purpose}`,
        `${formDataCopy.purpose}`
      ),
      formDataCopy
    );
    setShowModal(false);
    toast.success("Listing Created. Wait a moment.");
    router.push(`/category/${formDataCopy.purpose}/${docRef.id}`);
  };

  return (
    <section className="h-full flex w-full overflow-auto ">
      {showModal && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="rounded bg-slate-300 dark:bg-gray-800 sm:w-1/2 w-4/5 shadow-lg p-8">
            <div className="flex justify-center flex-col">
            <progress className="w-full" value={progress} max="100" />
            <p className="font-light text-sm text-gray-400">{progress} % done.</p>
            <p className="flex items-center justify-center mt-3">Your Listing is creating..</p>
            </div>
          </div>
        </div>
      )}
      <div className="glassmorphism m-auto mt-2 sm:w-4/5 w-full rounded">
        <h1 className="text-2xl text-center ">
          <span className="font-extrabold text-4xl">Create Listing</span>
        </h1>

        {/* Form for create listing */}
        <form className="glassmorphism mt-6" onSubmit={submitHandler}>
          {/* Purpose */}
          <div className="flex flex-row">
            <div className="form-check">
              {/* for rent */}
              <input
                type="radio"
                className="me-3"
                value="Rent"
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
                onChange={onChangeHandler}
                name="purpose"
                // id="purpose"
              />
              <label>
                <span className="form_label">Flatmates</span>
              </label>
            </div>
          </div>

          {/* Lister Name */}
          {/* <div className="mt-4" htmlFor="listerName">
            <label>
              <span className="form_label">Your Name</span>
            </label>
            <input
              type="text"
              className="form_input"
              value={listersName}
              name="listersName"
              onChange={onChangeHandler}
              required
            />
          </div> */}

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
              {purpose === "Rent" && propertyName !== "PG"&& (
                <div>
                  <input
                    type="radio"
                    className="me-3"
                    value="Family"
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
              required
            />
          </div>

          <button type="submit" className="dark:outline_btn black_btn mt-4">
            Create Listing
          </button>
        </form>
      </div>
    </section>
  );
};

export default createListing;
