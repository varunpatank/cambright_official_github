// v.0.0.01 salah

"use client";
import dynamic from "next/dynamic";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  FileVideo,
  Loader2,
  PlusCircle,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { saveAs } from "file-saver";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Chapter,
  CloudinaryData,
  NoteChapter,
  NoteCloudinaryData,
} from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

// Dynamically import the Player component
const Player = dynamic(() => import("@/components/Player"), { ssr: false });

interface VideoFormProps {
  initialData: NoteChapter & { cloudinaryData: NoteCloudinaryData | null };
  noteId: string;
  chapterId: string;
  chapterName: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const VideoForm = ({
  initialData,
  noteId,
  chapterId,
  chapterName,
}: VideoFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);

  const toggleEdit = () => {
    setIsEditing((current) => !current);
  };

  const handlePlayerLoad = () => {
    setIsPlayerLoaded(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/notes/${noteId}/chapters/${chapterId}`, values);
      router.refresh();
      toast.success("Chapter updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const videoJsOptions = {
    techOrder: ["html5"],
    autoplay: false,
    controls: true,
    responsive: true,
    sources: [
      {
        src: initialData.videoUrl || "",
        type: "video/mp4",
      },
    ],
  };
  const saveFile = () => {
    saveAs(initialData.videoUrl || "", `${chapterName} video`);
  };
  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        Chapter Video
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
          ) : !initialData.videoUrl ? (
            <>
              <PlusCircle className="h-4 mr-2 w-4" />
              Add video
            </>
          ) : (
            <>
              <FileVideo className="h-4 mr-2 w-4" />
              New
            </>
          )}
        </Button>
      </div>

      {!isEditing && !initialData.videoUrl && (
        <div className="flex items-center justify-center h-60 rounded-md bg-n-7 mt-2">
          <VideoIcon className="h-10 w-10 text-slate-300" />
        </div>
      )}

      {!isEditing && initialData.videoUrl && (
        <>
          <div
            className="relative aspect-video mt-2 video-container justify-center items-center"
            onContextMenu={(e) => e.preventDefault()}
          >
            {!isPlayerLoaded && (
              <div className="absolute inset-0 flex justify-center items-center">
                <Loader2 className="animate-spin h-10 w-10 text-white" />
              </div>
            )}
            <Player
              {...videoJsOptions}
              onReady={() => handlePlayerLoad()} // Ensure this is a function call
            />
          </div>
        </>
      )}

      {isEditing && (
        <div className="purplebtn">
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {initialData.videoUrl && (
        <Button onClick={saveFile} className="bg-n-7 hover:bg-transparent mt-2">
          <>
            <FileDown className="h-4 w-4 mr-2" />
            Download
          </>
        </Button>
      )}
    </div>
  );
};
