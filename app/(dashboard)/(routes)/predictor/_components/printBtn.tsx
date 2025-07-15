"use client";

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="text-[#267cc0] underline hover:opacity-50 no-print"
    >
      Print Results
    </button>
  );
};

export default PrintButton;
