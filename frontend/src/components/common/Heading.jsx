import React from "react";

const Heading = ({ heading }) => {
  return (
    <div className="text-center py-8">
      <h2 className="text-4xl font-bold text-gray-900">{heading}</h2>
    </div>
  );
};

export default Heading;

