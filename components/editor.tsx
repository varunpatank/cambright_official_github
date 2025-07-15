// v0.0.01 salah
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
interface EditorProps {
  onChange: (value: string) => void;
  value: string;
  classs?: string;
}
export const Editor = ({ onChange, value, classs }: EditorProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  return (
    <div className={` outline-n-8 border-n-8 ${classs}`}>
      <ReactQuill theme="snow" value={value} onChange={onChange} />
    </div>
  );
};
