import React from "react";

interface CardProps {
  backgroundImage: string;
  title: string;
  gradientIndex: number; // Pass an index or unique identifier for gradient selection
}

// Define an array of gradient colors including black and another color
const gradientColors = [
  ["#9C27B0", "#000000"], // Lighter Purple to Black
  ["#FF7043", "#000000"], // Lighter Orange to Black
  ["#42A5F5", "#000000"], // Lighter Blue to Black
  ["#66BB6A", "#000000"], // Lighter Green to Black
  ["#AB47BC", "#000000"], // Lighter Purple to Black
];

const getGradient = (index: number) => {
  // Use modulo to cycle through gradients if there are more cards than gradients
  const gradient = gradientColors[index % gradientColors.length];
  return gradient;
};

// Function to generate a random rotation angle between 0 and 360 degrees
const getRandomRotation = () => {
  return Math.floor(Math.random() * 180);
};

const GlateCard: React.FC<CardProps> = ({
  backgroundImage,
  title,
  gradientIndex,
}) => {
  const [startColor, endColor] = getGradient(gradientIndex);
  const rotationAngle = getRandomRotation(); // Generate a random rotation angle

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden group">
      {/* Blob Background with Unique Gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_dd)">
            <path
              d="M66.4,-80.8C86.6,-66.2,95.3,-44.3,95.8,-23.3C96.3,-2.2,88.5,16.1,74.7,34.4C60.9,52.6,40.8,68.8,23.5,63.7C6.1,58.6,-7.7,32.2,-28.4,22.7C-49.1,13.2,-75.7,20.6,-82.1,14.9C-88.5,9.1,-74.6,-8.4,-62.5,-29.3C-50.4,-50.1,-41.1,-72.9,-26.5,-84.1C-11.9,-95.4,10.4,-94.9,27.3,-83.4C44.2,-71.8,55.6,-48.3,66.4,-80.8Z"
              width="100%"
              height="100%"
              transform={`translate(100 100) rotate(${rotationAngle}) scale(1.1)`} // Apply random rotation
              fill={`url(#grad${gradientIndex})`}
            />
          </g>
          <defs>
            <filter
              id="filter0_dd"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
            <linearGradient
              id={`grad${gradientIndex}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: startColor, stopOpacity: 0.8 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: endColor, stopOpacity: 0.8 }}
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
          {/* Image Container */}
          <div className="relative flex items-center justify-center mb-4">
            <div
              className="transition-transform duration-500 ease-in-out group-hover:scale-[1.21]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "9rem", // Slightly smaller initial size
                height: "9rem", // Slightly smaller initial size
                borderRadius: "20%", // Circular shape
                position: "relative",
                zIndex: 1, // Ensure image is above text
              }}
            />
          </div>
          {/* Title Text */}
          <div className="relative flex items-center justify-center mt-2">
            <span className="text-white text-lg font-semibold z-5">
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlateCard;
