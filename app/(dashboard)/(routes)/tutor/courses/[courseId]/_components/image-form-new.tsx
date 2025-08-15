"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ImageDown, ImageIcon, PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";
import { AssetUpload } from "@/components/asset-upload";
import { AssetImageLoader } from "@/components/asset-image-loader";

interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  imageAssetId: z.string().optional(),
});

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageAssetId: initialData?.imageAssetId || undefined,
    },
  });
  
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, {
        imageAssetId: values.imageAssetId,
      });
      router.refresh();
      toast.success("Image updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleAssetChange = async (assetKey?: string) => {
    if (assetKey) {
      setUploadedAssetId(assetKey);
      try {
        await axios.patch(`/api/courses/${courseId}`, {
          imageAssetId: assetKey,
        });
        router.refresh();
        toast.success("Image updated!");
        toggleEdit();
      } catch {
        toast.error("Something went wrong");
      }
    }
  };

  // Determine image to display - prioritize uploaded asset, then existing asset, then old imageUrl
  const displayAssetId = uploadedAssetId || initialData.imageAssetId;
  const imageUrl = initialData.imageUrl || "";

  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        Course thumbnail
        <Button
          onClick={toggleEdit}
          className={
            isEditing
              ? "hover:bg-n-7 bg-transparent"
              : "bg-n-7 hover:bg-transparent"
          }
        >
          {isEditing ? (
            <XIcon />
          ) : !displayAssetId && !imageUrl ? (
            <>
              <PlusCircle className="h-4 mr-2 w-4" />
              Add image
            </>
          ) : (
            <>
              <ImageDown className="h-4 mr-2 w-4" />
              Edit Image
            </>
          )}
        </Button>
      </div>

      {!isEditing && !displayAssetId && !imageUrl && (
        <div className="flex items-center justify-center h-60 rounded-md bg-n-7 mt-2">
          <ImageIcon className="h-10 w-10 text-slate-300" />
        </div>
      )}

      {!isEditing && displayAssetId && (
        <div className="relative aspect-video mt-2">
          <AssetImageLoader
            assetKey={displayAssetId}
            alt="Course thumbnail"
            width={400}
            height={225}
            className="object-cover rounded-md w-full h-full"
            showLoadingState={true}
            showErrorState={true}
          />
        </div>
      )}

      {!isEditing && !displayAssetId && imageUrl && (
        <div className="relative aspect-video mt-2">
          <Image
            alt="Course thumbnail"
            sizes=""
            fill
            className="object-cover rounded-md"
            src={imageUrl}
            unoptimized
          />
        </div>
      )}

      {isEditing && (
        <div className="mt-4">
          <AssetUpload 
            onChange={handleAssetChange}
            assetType="COURSE_IMAGE"
            className="w-full"
          />
          {uploadedAssetId && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <AssetImageLoader
                assetKey={uploadedAssetId}
                alt="Course Image Preview"
                width={200}
                height={128}
                className="max-w-full h-32 object-cover rounded-lg"
                showLoadingState={true}
                showErrorState={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};