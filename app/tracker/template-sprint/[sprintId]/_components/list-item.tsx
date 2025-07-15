"use client";
import React, { ElementRef, useRef, useState, useMemo } from "react";
import { ListWithTasks } from "@/types";
import { ListHeader } from "./list-header";
import { cn } from "@/lib/utils";
import { TaskItem } from "./task-item";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { TaskForm } from "./TaskForm";
import { db } from "@/lib/db";

interface ListItemProps {
  index: number;
  data: ListWithTasks;
  dataz: ListWithTasks[];
  can: boolean;
}

export const ListItem = ({ index, data, dataz, can }: ListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const textAreaFormRef = useRef<ElementRef<"textarea">>(null);
  const disableEditing = () => {
    setIsEditing(false);
  };
  const enableEditing = (): void => {
    if (can) {
      setIsEditing(true);
      setTimeout((): void => {
        textAreaFormRef.current?.focus();
      });
    } else console.log(".");
  };

  const borderColor = useMemo(() => {
    const title = data.title.toLowerCase().replace(/\s+/g, ""); // Remove spaces and convert to lowercase

    if (title.includes("progress") || title.includes("to")) {
      return "border-yellow-500"; // Yellow for progress
    }
    if (
      title.includes("completed") ||
      title.includes("done") ||
      title.includes("solved")
    ) {
      return "border-green-500"; // Green for completed or done
    }
    if (title.includes("undone") || title.includes("incomplete")) {
      return "border-red-500"; // Red for undone or incomplete
    }

    return "border-purple-500"; // Default fallback color (if no match)
  }, [data.title]); // Only re-compute when the title changes

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full w-[272px] select-none"
        >
          <div
            {...provided.dragHandleProps}
            className={cn(
              "w-full rounded-md bg-n-6 shadow-md pb-2",
              borderColor, // Apply the calculated border color
              "border-t-4" // Ensure the border is applied to the top only
            )}
          >
            <ListHeader
              can={can}
              onAddTask={enableEditing}
              data={data}
              dataz={data.tasks.length}
            />
            <Droppable droppableId={data.id} type="task">
              {(provided) => (
                <ol
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "mx-1 px-1 py-0.5 flex flex-col gap-y-2",
                    data.tasks.length > 0 ? "mt-2" : "mt-0"
                  )}
                >
                  {data.tasks.map((task, index) => (
                    <TaskItem
                      can={can}
                      key={task.id}
                      index={index}
                      data={task}
                    />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            {can && (
              <TaskForm
                ref={textAreaFormRef}
                isEditing={isEditing}
                enableEditing={enableEditing}
                disableEditing={disableEditing}
                listId={data.id}
              />
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};
