import { Navigation, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Link from "next/link";

const SwiperImage = ({ listing, id, card }) => {
  SwiperCore.use([Autoplay]);
  return (
    <>
      {card ? (
        <Swiper
          modules={[Navigation, Scrollbar, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
          }}
          scrollbar={{ draggable: true }}
        >
          {listing.imgUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <Link href={`/category/${listing.purpose}/${id}`}>
                <img
                  className="object-cover rounded border-2"
                  style={{ aspectRatio: "3/2" }}
                  src={listing.imgUrls[index]}
                  alt={listing.purpose}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Swiper
          // install Swiper modules
          modules={[Navigation, Scrollbar, A11y]}
          spaceBetween={50}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
          }}
          scrollbar={{ draggable: true }}
        >
          {listing.imgUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <img
                className="object-contain h-auto rounded border-2 p-4  border-sky-950"
                style={{ aspectRatio: "3/2" }}
                src={listing.imgUrls[index]}
                alt={listing.purpose}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

export default SwiperImage;
