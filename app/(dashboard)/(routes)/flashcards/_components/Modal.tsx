import React, { useState, useEffect, useRef } from "react";

interface ModalProps {
  onClose: () => void;
  onApply: (
    bgColor: string,
    textColor: string,
    roundness: string,
    highlightColor: string
  ) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onApply }) => {
  const [bgColor, setBgColor] = useState<string>("n-6");
  const [textColor, setTextColor] = useState<string>("white");
  const [roundness, setRoundness] = useState<string>("lg");
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isHighlightColorOpen, setisHighlightColorOpen] = useState(false);
  const [isBgColorOpen, setIsBgColorOpen] = useState(false);
  const [isRoundnessOpen, setIsRoundnessOpen] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string>("[#75399b]");
  // Refs for dropdowns to check clicks outside
  const textColorRef = useRef<HTMLDivElement | null>(null);
  const bgColorRef = useRef<HTMLDivElement | null>(null);
  const highlightColorRef = useRef<HTMLDivElement | null>(null);
  const roundnessRef = useRef<HTMLDivElement | null>(null);

  // Available color options
  const colorOptions = [
    { label: "White", value: "white", bgColor: "bg-white" },
    { label: "Black", value: "black", bgColor: "bg-black" },
    { label: "Crimson", value: "red-400", bgColor: "bg-red-400" },
    { label: "Blue", value: "blue-400", bgColor: "bg-blue-400" },
  ];
  const highlightColorOptions = [
    { label: "Purple", value: "[#75399b]", bgColor: "bg-[#75399b]" },
    { label: "Crimson", value: "red-400", bgColor: "bg-red-400" },
    { label: "Pink", value: "pink-400", bgColor: "bg-pink-400" },
    { label: "Blue", value: "blue-400", bgColor: "bg-blue-400" },
    { label: "Green", value: "green-400", bgColor: "bg-green-400" },
    { label: "Yellow", value: "yellow-400", bgColor: "bg-yellow-400" },
  ];

  // Available background color options
  const bgColorOptions = [
    { label: "Dark", value: "n-7", bgColor: "bg-n-7" },
    { label: "Medium", value: "n-6", bgColor: "bg-n-5" },
    { label: "Light", value: "n-5", bgColor: "bg-n-4" },
    { label: "Yellow", value: "yellow-400", bgColor: "bg-yellow-400" },
    { label: "Red", value: "red-400", bgColor: "bg-red-400" },
    { label: "Blue", value: "blue-400", bgColor: "bg-blue-400" },
  ];

  // Available roundness options
  const roundnessOptions = [
    { label: "Large", value: "lg", bgColor: "rounded-lg" },
    { label: "Medium", value: "md", bgColor: "rounded-md" },
    { label: "None", value: "none", bgColor: "rounded-none" },
  ];

  const handleApply = () => {
    // Apply the styles and close the modal
    onApply(bgColor, textColor, roundness, highlightColor);
    onClose();
  };

  const handleColorSelect = (color: string) => {
    setTextColor(color);
    setIsTextColorOpen(false); // Close the dropdown after selecting a color
  };
  const handleHighlightColorSelect = (color: string) => {
    setHighlightColor(color);
    setisHighlightColorOpen(false);
  };

  const handleBgColorSelect = (color: string) => {
    setBgColor(color);
    setIsBgColorOpen(false); // Close the background color dropdown
  };

  const handleRoundnessSelect = (round: string) => {
    setRoundness(round);
    setIsRoundnessOpen(false); // Close the roundness dropdown
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textColorRef.current &&
        !textColorRef.current.contains(event.target as Node) &&
        bgColorRef.current &&
        !bgColorRef.current.contains(event.target as Node) &&
        roundnessRef.current &&
        !roundnessRef.current.contains(event.target as Node) &&
        highlightColorRef.current &&
        !highlightColorRef.current.contains(event.target as Node)
      ) {
        setIsTextColorOpen(false);
        setIsBgColorOpen(false);
        setIsRoundnessOpen(false);
        setisHighlightColorOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-n-7 p-8 rounded-xl w-96">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Customize Styles
        </h2>

        {/* Background Color Custom Dropdown */}
        <div className="mb-4">
          <label className="text-white">Background Color</label>
          <div className="relative mt-2" ref={bgColorRef}>
            <button
              onClick={() => setIsBgColorOpen(!isBgColorOpen)}
              className="bg-n-6 text-white p-2 w-full rounded-lg flex items-center justify-between pr-10"
            >
              <div className="flex items-center space-x-2">
                {/* Show selected background color circle */}
                <div
                  className={`w-5 h-5 rounded-full ${
                    bgColorOptions.find((c) => c.value === bgColor)?.bgColor ||
                    "bg-white"
                  }`}
                ></div>
                <span>
                  {bgColorOptions.find((c) => c.value === bgColor)?.label}
                </span>
              </div>
            </button>

            {/* Custom dropdown with circles for background color */}
            {isBgColorOpen && (
              <div className="absolute w-full mt-1 bg-n-6 rounded-lg shadow-md z-10">
                {bgColorOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleBgColorSelect(option.value)}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-n-5"
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${option.bgColor}`}
                    ></div>
                    <span className="text-white">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-white">Highlight Color</label>
          <div className="relative mt-2" ref={highlightColorRef}>
            <button
              onClick={() => setisHighlightColorOpen(!isHighlightColorOpen)}
              className="bg-n-6 text-white p-2 w-full rounded-lg flex items-center justify-between pr-10"
            >
              <div className="flex items-center space-x-2">
                {/* Show selected background color circle */}
                <div
                  className={`w-5 h-5 rounded-full ${
                    highlightColorOptions.find(
                      (c) => c.value === highlightColor
                    )?.bgColor || "bg-purple-500"
                  }`}
                ></div>
                <span>
                  {
                    highlightColorOptions.find(
                      (c) => c.value === highlightColor
                    )?.label
                  }
                </span>
              </div>
            </button>

            {/* Custom dropdown with circles for background color */}
            {isHighlightColorOpen && (
              <div className="absolute w-full mt-1 bg-n-6 rounded-lg shadow-md z-10">
                {highlightColorOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleHighlightColorSelect(option.value)}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-n-5"
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${option.bgColor}`}
                    ></div>
                    <span className="text-white">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Text Color Custom Dropdown */}
        <div className="mb-4">
          <label className="text-white">Text Color</label>
          <div className="relative mt-2" ref={textColorRef}>
            <button
              onClick={() => setIsTextColorOpen(!isTextColorOpen)}
              className="bg-n-6 text-white p-2 w-full rounded-lg flex items-center justify-between pr-10"
            >
              <div className="flex items-center space-x-2">
                {/* Show selected color circle */}
                <div
                  className={`w-5 h-5 rounded-full ${
                    colorOptions.find((c) => c.value === textColor)?.bgColor ||
                    "bg-white"
                  }`}
                ></div>
                <span>{textColor}</span>
              </div>
            </button>

            {/* Custom dropdown with circles for text color */}
            {isTextColorOpen && (
              <div className="absolute w-full mt-1 bg-n-6 rounded-lg shadow-md z-10">
                {colorOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleColorSelect(option.value)}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-n-5"
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${option.bgColor}`}
                    ></div>
                    <span className="text-white">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Roundness Custom Dropdown */}
        <div className="mb-4">
          <label className="text-white">Card Roundness</label>
          <div className="relative mt-2" ref={roundnessRef}>
            <button
              onClick={() => setIsRoundnessOpen(!isRoundnessOpen)}
              className="bg-n-6 text-white p-2 w-full rounded-lg flex items-center justify-between pr-10"
            >
              <div className="flex items-center space-x-2">
                {/* Show selected roundness */}
                <div
                  className={`w-5 h-5 rounded-full ${
                    roundnessOptions.find((c) => c.value === roundness)
                      ?.bgColor || "bg-white"
                  }`}
                ></div>
                <span>
                  {roundnessOptions.find((c) => c.value === roundness)?.label}
                </span>
              </div>
            </button>

            {/* Custom dropdown with circles for roundness */}
            {isRoundnessOpen && (
              <div className="absolute w-full mt-1 bg-n-6 rounded-lg shadow-md z-10">
                {roundnessOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleRoundnessSelect(option.value)}
                    className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-n-5"
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${option.bgColor}`}
                    ></div>
                    <span className="text-white">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-n-5 hover:opacity-50 transition-all text-white p-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleApply} // Apply the styles and close the modal
            className="bg-n-5 hover:opacity-50 transition-all text-white p-2 rounded-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
