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
import { Course } from "@prisma/client";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1, { message: "Please upload an image" }),
});

const subjectImages = [
  "https://getwallpapers.com/wallpaper/full/5/b/b/860080-biology-wallpapers-1920x1200-lockscreen.jpg",
  "https://getwallpapers.com/wallpaper/full/8/6/8/860146-biology-wallpapers-2560x1600-ipad-pro.jpg",
  "https://getwallpapers.com/wallpaper/full/d/9/3/59380.jpg",
  "https://getwallpapers.com/wallpaper/full/c/2/5/860125-biology-wallpapers-2560x1440-for-phones.jpg",
  "https://getwallpapers.com/wallpaper/full/3/8/6/860092-biology-wallpapers-1920x1080-for-computer.jpg",
  "https://getwallpapers.com/wallpaper/full/2/8/f/1056088-new-cute-chemistry-wallpaper-1920x1080-for-iphone-5s.jpg",
  "https://getwallpapers.com/wallpaper/full/7/e/5/591011.jpg",
  "https://getwallpapers.com/wallpaper/full/b/4/3/92913.jpg",
  "https://wallpaperswide.com/download/mathematics-wallpaper-2560x1600.jpg",
  "https://wallpaperswide.com/download/mathematics_3-wallpaper-2560x1440.jpg",
  "https://wallpaperswide.com/download/science-wallpaper-1920x1080.jpg",
  "https://c4.wallpaperflare.com/wallpaper/769/628/991/3-316-16-9-aspect-ratio-s-sfw-wallpaper-preview.jpg",
  "https://www.lappui.org/media/images/impots-16-9.original.png",
  "https://www.baltana.com/files/wallpapers-7/Science-Background-Wallpaper-23278.jpg",
  "https://c4.wallpaperflare.com/wallpaper/495/462/421/drugs-chemical-structures-chemistry-wallpaper-preview.jpg",
  "https://wallpaperswide.com/download/newton_s_pendulum-wallpaper-3840x2400.jpg",
  "https://i0.wp.com/medika.life/wp-content/uploads/2020/07/Circulatory-System.jpg?fit=696%2C381&ssl=1",
  "https://getwallpapers.com/wallpaper/full/c/5/c/428175.jpg",
  "https://w0.peakpx.com/wallpaper/983/999/HD-wallpaper-literature-book-inkpot-ink-feather.jpg",
  "https://wallpapers.com/images/featured/physics-w4ac9eqvnunc0ocp.jpg",
  "https://getwallpapers.com/wallpaper/full/f/a/3/1428467-full-size-solar-system-backgrounds-3840x2160-for-full-hd.jpg",
  "https://wallpaperswide.com/download/history-wallpaper-2560x1440.jpg",
  "https://wallpaperswide.com/download/islamic_2-wallpaper-2400x1350.jpg",
  "https://wallpapercave.com/wp/wp2972537.jpg",
  "https://wallpapers.com/images/hd/coding-background-9izlympnd0ovmpli.jpg",
  "https://www.baltana.com/files/wallpapers-2/World-Widescreen-Wallpapers-05124.jpg",
  "https://wallpaperswide.com/download/internet_business_6-wallpaper-1920x1080.jpg",
  "https://e0.pxfuel.com/wallpapers/453/87/desktop-wallpaper-graph.jpg",
  "https://wallpaperbat.com/img/566644-writing-wallpaper-in-english-1920x1080-download-hd-wallpaper-wallpapertip.png",
  "https://wallpaperswide.com/download/arabic___typography-wallpaper-1920x1080.jpg",
  "https://c4.wallpaperflare.com/wallpaper/444/551/708/chinese-brush-painting-chinese-character-japanese-characters-wallpaper-preview.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm7efBbfZyinnSGIeYZbXAse1xfRBVY4UWtA&s",
  "https://www.culture.gouv.fr/var/culture/storage/images/_aliases/illustration-16-9/6/9/1/4/5634196-1-fre-FR/f7448a22eb38-Politique-linguistique.PNG",
  "https://images.indianexpress.com/2019/09/hindi-diwas-gettyimages-616123470.jpg",
  "https://wallpapers.com/images/hd/black-and-white-drawings-1500-x-1000-wallpaper-j2k09t7iq189c6i5.jpg",
];

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
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
      await axios.patch(`/api/courses/${courseId}`, {
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
                    axios.patch(`/api/courses/${courseId}`, {
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
