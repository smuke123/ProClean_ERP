import React from "react";
import { category } from "../data/Data";

const Category = () => {
  return (
    <div className="w-1/2 m-auto py-8" style={{ marginBottom: "80px" }}>
      <h2 className="text-3xl font-bold text-center mb-8">Nuestras Categorías</h2>
      
      <div className="grid grid-cols-2" style={{ gap: "30px" }}>
        {category.map((item, key) => (
          <div 
            key={key} 
            className="cursor-pointer group"
            style={{ 
              position: "relative",
              height: "250px",
              borderRadius: "24px",
              border: "3px solid #e5e7eb",
              overflow: "hidden"
            }}
          >
            {/* Imagen de fondo */}
            <img
              src={item.img}
              alt={item.name}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              className="transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay oscuro en la parte inferior */}
            <div 
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2), transparent)"
              }}
            ></div>
            
            {/* Título centrado en la parte inferior */}
            <div 
              style={{
                position: "absolute",
                bottom: "20px",
                left: 0,
                right: 0,
                textAlign: "center",
                width: "100%"
              }}
            >
              <h3 
                className="text-4xl font-bold capitalize"
                style={{
                  color: '#ffffff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.5), 1px -1px 2px rgba(0,0,0,0.5), -1px 1px 2px rgba(0,0,0,0.5)',
                  margin: 0,
                  padding: 0
                }}
              >
                {item.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;

