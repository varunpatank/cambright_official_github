// v.0.0.01 salah

"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ConfirmModalEnroll } from "@/components/modals/confirm-modal-enroll";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
interface CourseNonEnrollButtonProps {
  courseId: string;
}
export const CourseNonEnrollButton = ({
  courseId,
}: CourseNonEnrollButtonProps) => {
  const [loading, setLoading] = useState(false);
  const confetti = useConfettiStore();
  const router = useRouter();
  const handleEnroll = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/courses/${courseId}/disenroll/`);
      toast.success("Disenrolled");
      router.refresh();
    } catch (err) {
      toast.error("Error disenrolling");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModalEnroll
      onConfirm={handleEnroll}
      continueText="disenroll"
      additionalText={`Are you sure you want to disenroll from this course?`}
      continueButtonColor="bg-red-500 hover:bg-red-800"
      typeToContinue={true}
    >
      <Button className="w-auto " variant={"outline"} disabled={loading}>
        {loading ? "..." : "Disenroll"}
      </Button>
    </ConfirmModalEnroll>
  );
};
