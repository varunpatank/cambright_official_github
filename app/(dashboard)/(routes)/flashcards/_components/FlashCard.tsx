import React, { useState } from "react";

interface FlashCardProps {
  question: string;
  answer: string;
  image: string; // Assuming the card may contain an image
  bgColor: string;
  textColor: string;
  roundness: string;
  highlightColor: string;
}

const FlashCard: React.FC<FlashCardProps> = ({
  question,
  answer,
  highlightColor,
  image,
  bgColor,
  textColor,
  roundness,
}) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped); // Toggle the flip state
  };

  return (
    <div className="card-container">
      <div
        onClick={handleFlip} // Flip the card when clicked
        className={`min-w-60 min-h-80 bg-${bgColor} text-${textColor} rounded-${roundness} relative cursor-pointer shadow-xl transition-all duration-500 transform`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 1s ease-in-out", // Flip duration
          transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)", // Flip effect
        }}
      >
        {/* Front of the flashcard */}
        <div
          className={`absolute inset-0 p-4 flex justify-center items-center bg-${bgColor} text-${textColor} rounded-${roundness} transition-opacity duration-1000 ${
            flipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="text-center">
            <p className="text-xl font-semibold">{question}</p>
            {image && (
              <div className="mt-4 flex justify-center items-center">
                <img
                  src={image}
                  alt="card-image"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        
        {/* Back of the flashcard */}
        <div
          className={`absolute inset-0 p-4 flex justify-center items-center bg-${bgColor} text-${textColor} rounded-${roundness} transform transition-opacity duration-1000 ${
            flipped ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: "rotateY(180deg)", // Ensure the back is rotated correctly
          }}
        >
          <div className="transform rotateY-180 relative">
            <p className="text-2xl font-semibold">{answer}</p>
            {/* Rotated purple line at top right */}
            <div
              className={`absolute bottom-[-2.5px] rounded-md right-0 w-10 h-1 bg-${highlightColor} transform  origin-bottom pt-1`}
              style={{
                boxShadow: `inset 0 0 0 1px bg-${highlightColor}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
