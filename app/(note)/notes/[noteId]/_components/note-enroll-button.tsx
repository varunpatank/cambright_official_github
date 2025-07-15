// v.0.0.01 salah

"use client";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
interface NoteEnrollButtonProps {
  noteId: string;
}
export const NoteEnrollButton = ({ noteId }: NoteEnrollButtonProps) => {
  const [loading, setLoading] = useState(false);
  const confetti = useConfettiStore();
  const router = useRouter();
  const handleEnroll = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/notes/${noteId}/enroll/`);
      toast.success("Enrolled!");
      confetti.onOpen();
      router.refresh();
    } catch (err) {
      toast.error("Error enrolling");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full md:w-auto"
      variant={"tert"}
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? "Enrolling..." : "Enroll"}
    </Button>
  );
};
