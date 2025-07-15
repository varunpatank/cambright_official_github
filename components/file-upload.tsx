// v0.0.01 salah
"use client";
import { MinioFileUpload } from "@/components/minio-file-upload";
import toast from "react-hot-toast";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: 'courseImage' | 'roomImage' | 'messageFile' | 'courseAttachment' | 'noteAttachment' | 'chapterVideo' | 'schoolPostImage';
}
export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <MinioFileUpload
      className="ut-label:text-purple-600 ut-allowed-content:text-purple-300 ut-button:bg-purple-600"
      endpoint={endpoint}
      onChange={onChange}
    />
  );
};
