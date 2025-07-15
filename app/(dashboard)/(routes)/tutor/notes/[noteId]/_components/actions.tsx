// v.0.0.01 salah

"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal-contin";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { Trash, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ActionsProps {
  disabled: boolean;
  noteId: string;
  isPublished: boolean;
}

export const Actions = ({ disabled, noteId, isPublished }: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCLoading, setIsCLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`/api/notes/${noteId}/unpublish`);
        toast.success("Notes unpublished");
      } else {
        await axios.patch(`/api/notes/${noteId}/publish`);
        toast.success("Note published!");
        confetti.onOpen();
      }
      router.refresh();
    } catch (error) {
      toast.error("Error");
    } finally {
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsCLoading(true);
      await axios.delete(`/api/notes/${noteId}`);
      toast.success("Note deleted");
      router.refresh();
      router.push(`/tutor/notes`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCLoading(true);
    }
  };

  return (
    <div className="relative flex items-center gap-x-2">
      {!isPublished && (
        <Button
          onClick={onClick}
          disabled={disabled || isLoading}
          variant={"tert"}
        >
          {isLoading ? "Publishing.." : "Publish"}
        </Button>
      )}
      {isPublished && (
        <Button onClick={onClick} disabled={isLoading} variant={"tert"}>
          {isLoading ? "Unpublishing.." : "Unpublish"}
        </Button>
      )}
      <ConfirmModal
        onConfirm={onDelete}
        continueText="Delete"
        additionalText={`Are you sure you want to delete this note?`}
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
