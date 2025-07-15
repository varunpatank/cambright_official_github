// v0.0.01 salah

"use client";

import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      toastOptions={{
        error: {
          style: {
            backgroundColor: "rgba(195, 18, 53, 0.897)",
            border: " solid rgb(105, 11, 30) 2px",
            color: "white",
          },
        },
        // position: "bottom-center",
      }}
    />
  );
};
