"use client";
import React, {
  forwardRef,
  useRef,
  ElementRef,
  KeyboardEventHandler,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { FormTextarea } from "@/app/tracker/group/_components/form/form-textarea";
import { FormSubmit } from "@/app/tracker/group/_components/form/form-submit";
import { useAction } from "@/hooks/use-action";
import { createTask } from "@/actions/create-task";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { useOnClickOutside, useEventListener } from "usehooks-ts";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // Assuming you're using shadcn popover
import { DayPicker } from "react-day-picker"; // Assuming you are using DayPicker from react-day-picker
import { Calendar } from "@/components/ui/calendar";

interface TaskFormProps {
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
  listId: string;
}
export const TaskForm = forwardRef<HTMLTextAreaElement, TaskFormProps>(
  ({ isEditing, enableEditing, disableEditing, listId }, ref) => {
    const params = useParams();
    const formRef = useRef<ElementRef<"form">>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null); // State for storing the selected due date
    const [calendarOpen, setCalendarOpen] = useState(false);

    // @ts-ignore
    const { execute, fieldErrors } = useAction(createTask, {
      onSuccess: (data) => {
        toast.success(`Task "${data.title}" created`);
        formRef.current?.reset();
        disableEditing();
        setDueDate(null);
      },
      onError: (error) => {
        toast.error(error);
      },
    });

    const handleDateChange = (newDate: Date | null) => {
      setDueDate(newDate); // Set the selected due date
      setCalendarOpen(false); // Only close the calendar popover
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing(); // Close the entire editing form when Escape is pressed
      }
    };

    // Modify useOnClickOutside to exclude clicks inside the popover
    useOnClickOutside(formRef, (event) => {
      if (!calendarOpen) {
        disableEditing(); // Close the form editing only when the popover is not open
      }
    });

    useEventListener("keydown", onKeyDown);

    const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      event
    ) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const onSubmit = (formData: FormData) => {
      const title = formData.get("title") as string;
      const listId = formData.get("listId") as string;
      const sprintId = params?.sprintId as string;

      execute({
        title,
        listId,
        sprintId,
        dueDate: dueDate ?? undefined,
      }).then();
    };

    if (isEditing) {
      return (
        <form
          className="m-1 py-0.5 px-1 space-y-4"
          ref={formRef}
          action={onSubmit}
        >
          <FormTextarea
            id="title"
            onKeyDown={onTextareaKeyDown}
            ref={ref}
            placeholder="Enter the title for this Task"
            errors={fieldErrors}
          />

          <div className="flex flex-col space-y-2">
            <label htmlFor="dueDate" className="text-sm">
              Choose Due Date
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                >
                  {dueDate ? dueDate.toLocaleDateString() : "Select Due Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-2"
                onClick={(e) => e.stopPropagation()} // Prevent popover from closing on internal clicks
              >
                <Calendar
                  mode="single"
                  selected={dueDate || undefined} // Allow undefined here to match the prop type
                  onSelect={(selectedDate) => {
                    handleDateChange(selectedDate ?? null); // Set the date but do not disable editing
                  }}
                  className="rounded-md border pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <input hidden id="listId" name="listId" value={listId} readOnly />
          <div className="flex items-center gap-x-1">
            <FormSubmit variant="tert">Add Task</FormSubmit>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="h-5 w-5 " />
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="pt-2 px-2">
        <Button
          onClick={enableEditing}
          className="h-auto px-2 py-1.5 w-full justify-start text-muted-foreground text-sm"
          variant="ghost"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          add Task
        </Button>
      </div>
    );
  }
);

TaskForm.displayName = "TaskForm";
