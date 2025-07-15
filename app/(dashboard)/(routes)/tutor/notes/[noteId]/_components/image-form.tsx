// v.0.0.01 salah

"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import {
  ImageDown,
  ImageIcon,
  Images,
  Pencil,
  PlusCircle,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@prisma/client";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
  initialData: Note;
  noteId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1, { message: "Please upload an image" }),
});

const subjectImages = [
  "/bioTH.png",
  "/chemTH.png",
  "/physTH.png",
  "/accountingTH.png",
  "/mathsTH.png",
  "/addmathsTH.png",
  "/businessTH.png",
  "/eslTH.png",
  "/csTH.png",
  "/ictTH.png",
  "/eflTH.png",
];

export const ImageForm = ({ initialData, noteId }: ImageFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: initialData?.imageUrl || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const imageUrlToSubmit = values.imageUrl;
      setSelectedImageUrl(null);
      await axios.patch(`/api/notes/${noteId}`, {
        imageUrl: imageUrlToSubmit,
      });
      router.refresh();
      toast.success("Image updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        note thumbnail
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
          ) : !initialData.imageUrl ? (
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

      {!isEditing && !initialData.imageUrl && (
        <div className="flex items-center justify-center h-60 rounded-md bg-n-7 mt-2">
          <ImageIcon className="h-10 w-10 text-slate-300" />
        </div>
      )}

      {!isEditing && initialData.imageUrl && (
        <div className="relative aspect-video mt-2">
          <Image
            alt="Upload"
            sizes=""
            fill
            className="object-cover rounded-md"
            src={initialData.imageUrl || ""}
          />
        </div>
      )}

      {isEditing && (
        <div className="purplebtn">
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4 flex justify-center items-center">
            <span className="border-t border-gray-400 w-1/4"></span>
            <span className="mx-2 text-gray-400">OR</span>
            <span className="border-t border-gray-400 w-1/4"></span>
          </div>{" "}
          <div className="relative mt-4 justify-center flex">
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full max-w-sm "
            >
              <CarouselContent>
                {subjectImages.map((imageUrl, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    <div className="p-1">
                      <div
                        className={`relative aspect-video ${
                          imageUrl === selectedImageUrl
                            ? "border-4 border-purple-500 rounded-md"
                            : ""
                        }`}
                      >
                        <Image
                          alt="Select"
                          sizes=""
                          fill
                          className="object-cover rounded-md"
                          src={imageUrl}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10" />
              <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10" />
            </Carousel>
          </div>
          {selectedImageUrl !== null && (
            <div className="w-full items-end justify-end my-2">
              <Button
                variant={"tert"}
                onClick={function submitter() {
                  try {
                    const imageUrlToSubmit = selectedImageUrl;
                    axios.patch(`/api/notes/${noteId}`, {
                      imageUrl: imageUrlToSubmit,
                    });
                    router.refresh();
                    toast.success("Image updated! (retry if not)");
                    toggleEdit();
                  } catch {
                    toast.error("Something went wrong");
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving.." : "Save"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
