// v0.0.01 salah
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
interface PreviewProps {
  value: string;
  classs?: string;
}
export const Preview = ({ value, classs }: PreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  return (
    <div className={`bg-transparent ${classs}`}>
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};
