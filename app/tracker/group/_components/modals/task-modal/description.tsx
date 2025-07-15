"use client";

import { TaskWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlignLeft } from "lucide-react";
import { ElementRef, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { FormTextarea } from "../../form/form-textarea";
import { FormSubmit } from "../../form/form-submit";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { updateTask } from "@/actions/update-task";
import { toast } from "react-hot-toast";

interface DescriptionProps {
  data: TaskWithList;
}

export const TaskDescription = ({ data }: DescriptionProps) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textAreaRef.current?.focus();
    });
  };
  const disableEditing = (): void => {
    setIsEditing(false);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  // @ts-ignore
  const { execute, fieldErrors } = useAction(updateTask, {
    onSuccess: (data): void => {
      queryClient
        .invalidateQueries({
          queryKey: ["task", data.id],
        })
        .then();
      queryClient
        .invalidateQueries({
          queryKey: ["task-logs", data.id],
        })
        .then();
      toast.success(`task "${data.title}" updated`);
      disableEditing();
    },
    onError: (error) => toast.error(error),
  });
  const onSubmit = (formData: FormData): void => {
    const description = formData.get("description") as string;
    const sprintId = params?.sprintId as string;
    execute({ description, sprintId, id: data.id }).then();
  };

  // Check if the dueDate is available and valid
  let dueDate = null;
  let dueDateClass = "text-white"; // Default color

  if (data.dueDate) {
    dueDate = new Date(data.dueDate);

    // Ensure that dueDate is a valid Date object
    if (isNaN(dueDate.getTime())) {
      dueDate = null;
    }
  }

  // If dueDate is valid, compare it to the current date
  if (dueDate) {
    const currentDate = new Date();
    const isPast = dueDate < currentDate;
    const isToday = dueDate.toDateString() === currentDate.toDateString();
    const isTomorrow =
      new Date(dueDate.setDate(dueDate.getDate() - 1)).toDateString() ===
      currentDate.toDateString();

    if (isPast) {
      dueDateClass = "text-red-500"; // Red for past dates
    } else if (isToday || isTomorrow) {
      dueDateClass = "text-yellow-500"; // Yellow for today or tomorrow
    }
  }

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 " />
      <div className="w-full">
        <p className="font-semibold mb-2">Description</p>
        {isEditing ? (
          <form action={onSubmit} ref={formRef} className="space-y-2">
            <FormTextarea
              id="description"
              className="w-full mt-2"
              placeholder="Add more detailed description"
              defaultValue={data.description || undefined}
              errors={fieldErrors}
              ref={textAreaRef}
            />
            <div className="flex items-center gap-x-2">
              <FormSubmit variant="tert">Save</FormSubmit>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={disableEditing}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role={"button"}
            className="min-h-[78px] bg-n-6 text-sm font-medium py-3 px-3.5 rounded-md"
          >
            {data.description || "Add more detailed description"}
          </div>
        )}

        {/* Display Due Date */}
        {dueDate ? (
          <p className={`mt-2 ${dueDateClass}`}>
            Due Date: {dueDate.toLocaleDateString()}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No due date set</p>
        )}
      </div>
    </div>
  );
};

TaskDescription.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="bg-neutral-200 w-24 h-6 mb-2" />
        <Skeleton className="bg-neutral-200 w-full h-[78px]" />
      </div>
    </div>
  );
};
