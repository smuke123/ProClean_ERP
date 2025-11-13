import React from "react";
import { banners } from "../data/Data";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MdOutlineCleaningServices } from "react-icons/md";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";

const Banner = () => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <IoIosArrowRoundBack />,
    nextArrow: <IoIosArrowRoundForward />,
  };

  return (
    <div className="banner py-8">
      <div className="w-full px-4 sm:w-10/12 m-auto">
        <div className="mb-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
                Productos de limpieza de calidad
              </h1>
            </div>
          </div>
        </div>
        <div className="w-full">
          <Slider {...settings}>
            {banners.map((data, key) => (
              <div className="banner-slider rounded-3xl" key={key}>
                <img
                  src={data.banner}
                  alt={`Banner ${key + 1}`}
                  className="rounded-3xl w-full h-56 sm:h-80 object-cover"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Banner;

