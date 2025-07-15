"use client";
import React from "react";
import { Task } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useTaskModal } from "@/hooks/use-task-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ConfirmModalVeryCustom } from "@/components/modals/confirm-modal-verycustom";

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
  can: boolean;
}

export const TaskItem = ({ index, data, can }: TaskItemProps) => {
  const taskModal = useTaskModal();

  // Check if the due date has passed
  const dueDatePassed = isDueDatePassed(data.dueDate);

  const handleOpen = () => {
    if (can) {
      taskModal.onOpen(data.id);
    }
  };

  const handleConfirm = () => {
    // Check if the button with ID "add_sprinter" exists
    const button = document.getElementById("add_sprinter");
    if (button) {
      // Trigger the button's click event if the button is found
      button.click();
    }
  };

  return (
    <div>
      {!can && (
        <ConfirmModalVeryCustom
          onConfirm={handleConfirm} // Call handleConfirm on confirm
          continueText="Grab"
          cannot={true}
          Title="Grab Template"
          additionalText={`You need to grab this template to edit it..`}
          continueButtonColor="bg-purple-600 hover:bg-purple-800"
          typeToContinue={false}
        >
          {/* Wrap the content in a single div */}
          <div
            role="button"
            className="truncate border-2 border-transparent hover:border-n-6 py-2 px-3 text-sm bg-n-7 rounded-md shadow-sm flex items-center justify-between"
          >
            <span className="flex-1">{data.title}</span>
            {/* Render a small red circle if the due date has passed */}
            {dueDatePassed && (
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            )}
          </div>
        </ConfirmModalVeryCustom>
      )}
      {can && (
        <Draggable draggableId={data.id} index={index}>
          {(provided) => (
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              role="button"
              onClick={handleOpen} // Fixed to properly call handleOpen
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
      )}
    </div>
  );
};
