"use client";
import React from "react";
import { Task } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useTaskModal } from "@/hooks/use-task-modal";

// Helper function to check if the due date has passed
const isDueDatePassed = (dueDate: Date | null) => {
  if (!dueDate) {
    return false; // If the due date is null, it hasn't passed
  }

  const due = new Date(dueDate); // Ensure dueDate is a Date object
  const today = new Date();
  return due < today;
};

interface TaskItemProps {
  index: number;
  data: Task;
}

export const TaskItem = ({ index, data }: TaskItemProps) => {
  const taskModal = useTaskModal();

  // Check if the due date has passed
  const dueDatePassed = isDueDatePassed(data.dueDate);

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => taskModal.onOpen(data.id)}
          className="truncate border-2 border-transparent hover:border-n-6 py-2 px-3 text-sm bg-n-7 rounded-md shadow-sm flex items-center justify-between"
        >
          <span className="flex-1">{data.title}</span>
          {/* Render a small red circle if the due date has passed */}
          {dueDatePassed && (
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          )}
        </div>
      )}
    </Draggable>
  );
};
