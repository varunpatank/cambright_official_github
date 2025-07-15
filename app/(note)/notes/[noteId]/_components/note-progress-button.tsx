// v.0.0.01 salah

"use client";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface NoteProgressButtonProps {
  chapterId: string;
  noteId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const NoteProgressButton = ({
  chapterId,
  noteId,
  isCompleted,
  nextChapterId,
}: NoteProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      await axios.put(`/api/notes/${noteId}/chapters/${chapterId}/progress`, {
        isCompleted: !isCompleted,
      });

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }
      if (!isCompleted && nextChapterId) {
        router.push(`/notes/${noteId}/chapters/${nextChapterId}`);
      }
      toast.success("Progress updated");
      router.refresh();
    } catch (error) {
      console.error("Error updating progress:", error); // Improved error logging
      toast.error("Something went wrong..");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;
  return (
    <Button
      type="button"
      variant={isCompleted ? "outline" : "success"}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading
        ? "Updating.."
        : isCompleted
        ? "Not completed"
        : "Mark as completed"}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  );
};
