// v0.0.01 salah

"use client";
import "./load.css";
import { GraduationCap, Loader2 } from "lucide-react"; // Make sure this import matches your actual Loader2 import path
import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="scale-150 fixed inset-0 z-50 flex items-center justify-center  bg-opacity-75 backdrop-blur-md">
      <GraduationCap className="h-5 w-5 absolute mb-1" />
      <div className="loader"></div>
    </div>
  );
};

export default LoadingOverlay;
