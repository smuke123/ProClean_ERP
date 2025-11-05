import React from "react";
import { offer } from "../data/Data";

const Offer = () => {
  return (
    <div className="mt-8 py-8">
      <div className="w-10/12 m-auto">
        <div>
          {offer.map((data, key) => (
            <div key={key}>
              <div className="relative">
                <div className="craft-img rounded-3xl overflow-hidden">
                  <img
                    src={data.customer_img}
                    alt="Oferta especial"
                    className="w-full rounded-3xl h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offer;

