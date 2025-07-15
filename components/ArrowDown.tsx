// v0.0.01 salah
import React from "react";

const ArrowDown = () => {
  return (
    <div className="scroll-arrow">
      <svg
        width="48" // Increased width
        height="48" // Increased height
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="arrow-icon"
      >
        <path
          d="M12 16.293l4.293-4.293 1.414 1.414L12 19.121l-5.707-5.707 1.414-1.414L12 16.293z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default ArrowDown;
