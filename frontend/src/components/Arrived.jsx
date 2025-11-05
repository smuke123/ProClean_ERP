import React from "react";
import { arriveItems } from "../data/Data";
import Heading from "../components/common/Heading";
import { FaInstagram } from "react-icons/fa";

const Arrived = () => {
  return (
    <div className="py-8" style={{ marginBottom: "80px" }}>
      <div className="w-10/12 m-auto">
        <Heading heading={"Recién Llegados"} />
        <div className="flex items-center mt-10 gap-8">
          <div className="w-2/5">
            <h1 className="font-semibold text-3xl">Tienda de Instagram</h1>
            <p className="my-4 text-gray-600">
              Etiquétanos @proclean_erp en tus fotos de Instagram para salir en esta sección.
            </p>
            <a
              href="https://instagram.com/smuke123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border bg-blue-600 hover:bg-blue-700 transition-colors rounded-full text-white px-6 py-3"
            >
              Visita nuestro Instagram
            </a>
          </div>
          <div className="w-3/5 grid grid-cols-3" style={{ gap: "20px" }}>
            {arriveItems.map((item, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
                style={{ 
                  position: "relative",
                  height: "200px",
                  borderRadius: "24px",
                  border: "2px solid #e5e7eb",
                  overflow: "hidden"
                }}
              >
                {/* Imagen con tamaño fijo */}
                <img
                  src={item.img}
                  alt={`Producto ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />

                {/* Icono de Instagram */}
                <div 
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    padding: "8px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 10
                  }}
                >
                  <div 
                    style={{
                      padding: "8px",
                      background: "linear-gradient(to right, #9333ea, #db2777)",
                      borderRadius: "50%",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaInstagram />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arrived;

