// v0.0.01 salah
"use client";
import { MinioFileUpload } from "@/components/minio-file-upload";
import toast from "react-hot-toast";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "roomImage";
}
export const FileUpload = ({ onChange, endpoint, value }: FileUploadProps) => {
  const fileType = value?.split(".").pop();
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        {/* <PhotoProvider> */}
        {/* <PhotoView src={value}> */}
        <Image fill src={value} alt="Upload" className="rounded-full" />
        {/* </PhotoView> */}
        {/* </PhotoProvider> */}
        <button
          onClick={() => onChange("")}
          className="bg-rose-600 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm hover:animate-bounced"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center pt-2 mt-2 rounded-md bg-n-8">
        {/* <PhotoProvider> */}
        {/* <PhotoView src={value}> */}
        <FileIcon className="fill-n-7 stroke-purple-500 h-10 w-10" />
        {/* </PhotoView> */}
        {/* </PhotoProvider> */}
        <button
          onClick={() => onChange("")}
          className="bg-rose-600 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm hover:animate-bounced"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-purple-400 hover:underline"
        >
          {value}
        </a>
      </div>
    );
  }
  return (
    <MinioFileUpload
      className="ut-label:text-purple-600 ut-allowed-content:text-purple-300 ut-button:bg-purple-600 border-n-5 border-dashed"
      endpoint={endpoint}
      onChange={onChange}
    />
  );
};
