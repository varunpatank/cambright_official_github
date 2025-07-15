// v0.0.01 salah

import { ChevronDown } from "lucide-react";
import { FaMouse } from "react-icons/fa";

const ScrollDownButton = () => {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#next-section") as HTMLElement;
    if (nextSection) {
      window.scrollTo({
        top: nextSection.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={scrollToNextSection}
      className="fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full shadow-lg flex flex-col items-center justify-center space-y-1 cursor-pointer"
      aria-label="Scroll Down"
    >
      <FaMouse className="text-2xl" />
      <ChevronDown className="text-xl" />
    </button>
  );
};

export default ScrollDownButton;
