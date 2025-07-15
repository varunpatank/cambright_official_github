// components/SolvedCard.js

import Link from "next/link";

const SolvedCard = () => {
  return (
    <Link href="/past-papers/solved">
      <div
        className="relative group rounded-lg overflow-hidden shadow-lg bg-cover bg-center h-64 w-full"
        style={{
          backgroundImage: "url('/solved.png')", // Add your background image path here
        }}
      >
        {/* Overlay background */}
        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-60 transition-all duration-300"></div>

        {/* "Solved" Text */}
        <div className="absolute bottom-4 left-4 text-white text-2xl md:text-3xl font-semibold">
          Solved
        </div>

        {/* "New" Badge */}
        <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
          New
        </div>
      </div>
    </Link>
  );
};

export default SolvedCard;
