// v.0.0.01 salah

"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ChapterActionsProps {
  disabled: boolean;
  noteId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  noteId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCLoading, setIsCLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(
          `/api/notes/${noteId}/chapters/${chapterId}/unpublish`
        );
        toast.success("Chapter unpublished");
      } else {
        await axios.patch(`/api/notes/${noteId}/chapters/${chapterId}/publish`);
        toast.success("Chapter published!");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsCLoading(true);
      await axios.delete(`/api/notes/${noteId}/chapters/${chapterId}`);
      toast.success("Chapter deleted");
      router.push(`/tutor/notes/${noteId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant={"tert"}
      >
        {isPublished
          ? isLoading
            ? "Unpublishing.."
            : "Unpublish"
          : isLoading
          ? "Publishing..."
          : "Publish"}
      </Button>
      <ConfirmModal
        onConfirm={onDelete}
        continueText="Delete"
        additionalText={`Are you sure you want to delete this chapter?`}
        continueButtonColor="bg-red-500 hover:bg-red-800"
        typeToContinue={true}
      >
        <Button variant={"destructive"}>
          <Trash className="w-4 h-4" />
        </Button>
      </ConfirmModal>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}
      {isCLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}
    </div>
  );
};
