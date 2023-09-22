"use client";
import ListingCard from "@components/ListingCard";
import Loading from "@components/Loading";
import { db } from "@firebaseConfig";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const category = () => {
  const params = useParams();

  const [applyFiltersClicked, setApplyFiltersClicked] = useState(false);
  const [categoryListings, setCategoryListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    availability: "",
    brokerage: false,
    propertyName: " ",
    rentAmount: 0,
    flatType: " ",
    tennants: " ",
    state: " ",
    localityName: " ",
  });

  const {
    availability,
    brokerage,
    propertyName,
    rentAmount,
    flatType,
    tennants,
    state,
    localityName,
  } = searchData;

  useEffect(() => {
    const categoryFetchListing = async () => {
      try {
        const categoryRef = collection(
          db,
          "listings",
          `flatHunt${params.type}`,
          params.type
        );
  
        const q = query(categoryRef, orderBy("timestamp", "desc"),limit(10)); // Add orderBy to the query
  
        const categorySnapshot = await getDocs(q);
        const categoryDocs = [];
  
        categorySnapshot.forEach((doc) => {
          return categoryDocs.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setCategoryListings(categoryDocs);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    };
    categoryFetchListing();
  }, []);
  

  const onChange = (e) => {
    const { name, value } = e.target;

    setSearchData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // // Perform Firestore query based on the updated search criteria
    const fetchData = async () => {
      try {
        const queryRef = collection(
          db,
          "listings",
          `flathunt${params.type}`,
          params.type
        );
        let querySnapshot = queryRef;

        // Apply filters based on the search criteria
        if (name === "propertyName" && value !== "") {
          querySnapshot = query(
            querySnapshot,
            where("propertyName", "==", value)
          );
        }
        if (name === "flatType" && value !== "") {
          querySnapshot = query(querySnapshot, where("flatType", ">=", value));
        }
        if (name === "tennants" && value !== "") {
          querySnapshot = query(querySnapshot, where("tennants", ">=", value));
        }
        if(name === "availability" && value !== ""){
          querySnapshot = query(querySnapshot, where("availability", ">=" , value));
        }

        // Execute the query and retrieve the data
        const snapshot = await getDocs(querySnapshot);
        const result = snapshot.docs.map((doc) => doc.data());

        console.log(result);
        // Update state with the query result
        setQueryResult(result);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchData();
  };

  const filterListings = ()=>{
    alert(searchData);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="h-full w-full">
      <div className="flex flex-col my-3">
        <button
          className="text-sm  font-sans font-bold"
          onClick={() => {
            setApplyFiltersClicked((prevState) => !prevState);
          }}
        >
          Apply Filters
        </button>
        <div>
          {applyFiltersClicked && (
            <form
              className="glassmorphism grid gap-3 sm:grid-cols-1 md:grid-cols-2 mt-3 lg:grid-cols-4"
              onSubmit={filterListings}
            >
              {/* Property Name */}
              <div className="flex flex-col my-3 mx-2">
                <label className="form_label">Property</label>
                <select
                  value={propertyName}
                  onChange={onChange}
                  name="propertyName"
                  id="propertyName"
                >
                  <option default>Select Property</option>
                  <option value="PG" name="propertyName" id="propertyName">
                    PG
                  </option>
                  <option
                    value="Apartment/Flat"
                    name="propertyName"
                    id="propertyName"
                  >
                    Apartment/Flat
                  </option>
                  <option
                    value="Independent Home"
                    name="propertyName"
                    id="propertyName"
                  >
                    Independent Home
                  </option>
                </select>
              </div>

              {/* If the property is of Apartment/flat type */}
              {(propertyName === "Apartment/Flat" ||
                propertyName === "Independent Home") && (
                <div className="flex flex-col my-3 mx-2">
                  <label className="form_label">BHKs</label>
                  <select
                    value={flatType}
                    onChange={onChange}
                    className="ms-3 "
                    placeholder="Select BHKs"
                    name="flatType"
                    id="flatType"
                  >
                    <option default>Select BHKs</option>

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

              {/* Tennants */}
              <div className="flex flex-col my-3 mx-2">
                <label className="form_label" htmlFor="tennants">
                  <span className="form_label">Preffered Tennants</span>
                </label>

                <div>
                  <div>
                    {/* Male */}
                    <input
                      type="radio"
                      className="me-3"
                      value="Male"
                      onChange={onChange}
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
                      onChange={onChange}
                      name="tennants"
                      // id="tennants"
                    />
                    <label>
                      <span className="form_label">Female</span>
                    </label>
                  </div>

                  {/* Any */}
                  {params.type !== "Flatmates" && (
                    <div>
                      <input
                        type="radio"
                        className="me-3"
                        value="Any"
                        onChange={onChange}
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
                  {params.type === "Rent" && propertyName !== "PG" && (
                    <div>
                      <input
                        type="radio"
                        className="me-3"
                        value="Family"
                        onChange={onChange}
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

              {/* Availability */}
              <div className="flex flex-col my-3 mx-2">
                <label className="mb-2" htmlFor="availability">
                  <span className="form_label">Availability</span>
                </label>

                <div>
                  <div>
                    {/* Immediate */}
                    <input
                      type="radio"
                      className="me-3"
                      value="Immediate"
                      onChange={onChange}
                      name="availability"
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
                      onChange={onChange}
                      name="availability"
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
                      onChange={onChange}
                      name="availability"
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
                      onChange={onChange}
                      name="availability"
                    />
                    <label>
                      <span className="form_label">After 30 days</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Rent Amount */}
              <div className="flex flex-col my-3 mx-2">
                <label className="mb-2" htmlFor="availability">
                  <span className="form_label">Rent</span>
                </label>
                <p>Rs. {rentAmount} /m</p>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={5000}
                  name="rentAmount"
                  onChange={onChange}
                />
              </div>

              {/* brokerage */}
              <div className="flex flex-col my-3 mx-2">
                <label className="form_label" htmlFor="tennants">
                  <span className="form_label">Brokerage</span>
                </label>

                <div>
                  <div>
                    {/* Yes */}
                    <input
                      type="radio"
                      className="me-3"
                      value={true}
                      onChange={onChange}
                      name="brokerage"
                      // id="tennants"
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
                      value={false}
                      onChange={onChange}
                      name="brokerage"
                      // id="tennants"
                    />
                    <label>
                      <span className="form_label">No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* city/locality/society Name */}
              <div>
                <label>
                  <span className="form_label">City/Society Name</span>
                </label>
                <input
                  type="text"
                  className="me-3"
                  value={localityName}
                  onChange={onChange}
                  name="localityName"
                />
              </div>

              {/* State */}
              <div>
                <label>
                  <span className="form_label">State</span>
                </label>
                <input
                  type="text"
                  className="me-3"
                  value={state}
                  onChange={onChange}
                  name="state"
                />
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!loading &&
          categoryListings &&
          categoryListings.length > 0 &&
          categoryListings.map((category) => {
            return (
              <ListingCard
                key={category.id}
                listing={category.data}
                id={category.id}
                className="col-span-1 sm:col-span-1 md:col-span-2"
              />
            );
          })}
      </div>
    </section>
  );
};

export default category;
