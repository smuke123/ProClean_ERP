import React from "react";
import { footer } from "../../data/Data";

const Footer = () => {
  return (
    <footer style={{ flexShrink: 0 }}>
      <div style={{ backgroundColor: "#1f2937" }}>
        <div className="w-10/12 m-auto">
          <div className="flex justify-between py-14 gap-8">
            {footer.map((item, key) => (
              <div className="w-2/6" key={key}>
                <h1 
                  className="text-2xl mb-5 font-bold"
                  style={{ color: "#3b82f6" }}
                >
                  {item.header}
                </h1>
                {item.content1 && <p className="mb-2" style={{ color: "#d1d5db" }}>{item.content1}</p>}
                {item.content2 && <p className="mb-2" style={{ color: "#e5e7eb" }}>{item.content2}</p>}
                {item.content3 && <p className="mb-2" style={{ color: "#d1d5db" }}>{item.content3}</p>}
                {item.content4 && <p className="mb-2" style={{ color: "#e5e7eb" }}>{item.content4}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
