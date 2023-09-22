"use Client";
import Moment from "react-moment";
import SwiperImage from "./SwiperImage";
import Link from "next/link";
import { AiTwotoneEdit } from "react-icons/ai";
import { MdLocationOn } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { BiRupee } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";

const ListingCard = ({ listing, id, onDelete, onEdit }) => {

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg relative my-4 border-b-2 p-2">
      <Moment
        className="border w-fit p-1 absolute top-1 text-xs  rounded-xl dark:text-gray-800 bg-slate-200 italic z-10"
        fromNow
      >
        {listing.timestamp?.toDate()}
      </Moment>
      <SwiperImage listing={listing} card={true} id={id} />
      <div className="p-2">
        <Link href={`/category/${listing.purpose}/${id}`}>
          <div className="font-semibold text-base mb-2 flex items-center flex-row gap-1">
            <MdLocationOn />
            {listing.localityName}, {listing.state}
          </div>
          <p className="text-gray-400 text-base mb-2">
            {listing.description.slice(0, 60)}
            <span className="text-blue-700 font-bold">....Know more</span>
          </p>
          <p className="text-base flex items-center flex-row gap-1">
            <IoHome />
            {listing.propertyName}
          </p>
          <h1 className="text-base flex items-center gap-1 flex-row ">
            <BiRupee />
            {listing.rentAmount} /Month
          </h1>
        </Link>
      </div>
      <div className="flex flex-row items-center gap-4 mb-3">
        {onDelete && (
          <button
            className="red_btn" 
            onClick={() => {
              onDelete(listing.id,listing.purpose);
            }}
          >
            <FaTrash className="z-3" />
          </button>
        )}

        {onEdit && (
          <button
            className="black_btn"
            onClick={() => {
              onEdit(listing.id,listing.purpose);
            }}
          >
            <AiTwotoneEdit className="z-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
