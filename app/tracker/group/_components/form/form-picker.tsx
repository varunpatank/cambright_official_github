"use client";
import React, { useEffect, useState } from "react";
import { unsplash } from "@/lib/unsplash";
import { defaultImages } from "@/constants/image";
import { Check, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FormErrors } from "../form-errors";
import { IoReload } from "react-icons/io5";

// Define color circles with corresponding image URLs to be used for selection
const colorCircles = [
  {
    color: "white",
    imageUrl:
      "https://images.unsplash.com/photo-1617713964959-d9a36bbc7b52?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTF8fHxlbnwwfHx8fHw%3D",
  },
  {
    color: "black",
    imageUrl:
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?ixlib=rb-4.0.3",
  },
  {
    color: "red-400",
    imageUrl:
      "https://images.unsplash.com/flagged/photo-1593005510509-d05b264f1c9c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    color: "pink-400",
    imageUrl:
      "https://images.unsplash.com/photo-1611521063806-b8be8b1b437a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTJ8fHxlbnwwfHx8fHw%3D",
  },
  {
    color: "yellow-400",
    imageUrl:
      "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8eWVsbG93JTIwd2FsbHBhcGVyfGVufDB8fDB8fHww",
  },
  {
    color: "blue-400",
    imageUrl:
      "https://images.unsplash.com/photo-1589859762194-eaae75c61f64?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhkJTIwYmx1ZSUyMHdhbGxwYXBlcnN8ZW58MHx8MHx8fDA%3D",
  },
  {
    color: "green-400",
    imageUrl:
      "https://images.unsplash.com/photo-1601370690183-1c7796ecec61?fm=jpg&q=60&w=3000&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Z3JlZW58ZW58MHx8MHx8fDA%3D",
  },
];

interface FormPickerProps {
  id: string;
  errors?: Record<string, string[]> | undefined;
}

export const FormPicker = ({ id, errors }: FormPickerProps) => {
  const { pending } = useFormStatus();
  const [images, setImages] = useState<Array<Record<string, any>>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedColorImageUrl, setSelectedColorImageUrl] = useState<
    string | null
  >(null); // For color circle selection

  useEffect(() => {
    // Fetch images from Unsplash
    const fetchImages = async () => {
      setIsLoading(true); // Set loading state
      try {
        const result = await unsplash.photos.getRandom({
          collectionIds: ["317099"],
          count: 9,
        });
        if (result && result.response) {
          const res = result.response as Array<Record<string, any>>;
          setImages(res);
        } else {
          console.error("Failed to fetch images");
        }
      } catch (error) {
        console.error(error);
        setImages(defaultImages); // Use default images on failure
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages().then();
  }, []);

  const manFetchImages = async () => {
    setIsLoading(true); // Set loading state
    try {
      const result = await unsplash.photos.getRandom({
        collectionIds: ["317099"],
        count: 9,
      });
      if (result && result.response) {
        const res = result.response as Array<Record<string, any>>;
        setImages(res);
      } else {
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error(error);
      setImages(defaultImages); // Use default images on failure
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-purple-700 animate-spin" />
      </div>
    );
  }

  // Handle the click event for color circle selection
  const handleColorCircleClick = (circleData: any) => {
    // Send the image data in the same format required by the backend
    const imageData = `${circleData.color}|${circleData.imageUrl}|${circleData.imageUrl}|${circleData.imageUrl}|Color Name`;
    setSelectedColorImageUrl(imageData); // Set the formatted string for color
    setSelectedImageId(null); // Clear Unsplash image selection
  };

  return (
    <div className="relative">
      {/* Unsplash Image Picker */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              `cursor-pointer relative aspect-video group hover:opacity-75 transition bg-purple-400/50 rounded-md`,
              pending && "opacity-50 hover:opacity-50 cursor-auto"
            )}
            onClick={() => {
              if (pending) return;
              setSelectedImageId(image.id);
              setSelectedColorImageUrl(null); // Clear color circle selection
            }}
          >
            <input
              type="radio"
              id={id}
              name={id}
              className="hidden"
              checked={selectedImageId === image.id}
              readOnly
              disabled={pending}
              value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
            />
            <Image
              src={image.urls.thumb}
              alt="image"
              fill
              className="object-cover rounded-sm"
            />
            {selectedImageId === image.id && (
              <div className="absolute inset-y-0 h-full w-full bg-purple-600/30 flex items-center justify-center rounded-md">
                <Check className="w-4 h-4 text-white " />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button in Bottom Right of 9th Image */}
      {!isLoading && (
        <button
          onClick={manFetchImages} // Trigger image refetch
          disabled={pending} // Disable button if pending is true
          className="absolute bottom-14 right-0 p-2  text-muted-foreground hover:text-white rounded-full   transition-all"
        >
          <IoReload className="w-4 h-4 " />
        </button>
      )}

      {/* Separator */}
      <div className="flex items-center justify-center my-4 mt-6">
        <div className="flex-1 border-t border-muted"></div>
        <span className="mx-4 text-gray-500">or</span>
        <div className="flex-1 border-t border-muted"></div>
      </div>

      {/* Color Circle Picker */}
      <div className="grid grid-cols-7 gap-4 mt-4">
        {colorCircles.map((circle, index) => (
          <div
            key={index}
            className={cn(
              "cursor-pointer relative w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-semibold border-2 border-gray-300 transition duration-300",
              `bg-${circle.color}`,
              pending && "opacity-50 hover:opacity-50 cursor-auto"
            )}
            onClick={() => handleColorCircleClick(circle)}
          >
            <input
              type="radio"
              id={`${id}-${circle.color}`}
              name={id}
              className="hidden"
              checked={
                selectedColorImageUrl ===
                `${circle.color}|${circle.imageUrl}|${circle.imageUrl}|${circle.imageUrl}|Color Name`
              }
              readOnly
              disabled={pending}
              value={`${circle.color}|${circle.imageUrl}|${circle.imageUrl}|${circle.imageUrl}|Color Name`}
            />
            {selectedColorImageUrl ===
              `${circle.color}|${circle.imageUrl}|${circle.imageUrl}|${circle.imageUrl}|Color Name` && (
              <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Errors */}
      <FormErrors id="image" errors={errors} />
    </div>
  );
};
