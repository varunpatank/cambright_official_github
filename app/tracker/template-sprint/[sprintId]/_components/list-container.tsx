"use client";
import React, { useEffect, useState } from "react";
import { Droppable, DragDropContext } from "@hello-pangea/dnd";
import { ListWithTasks, TaskWithList } from "@/types";
import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { toast } from "react-hot-toast";
import { updateTaskOrder } from "@/actions/update-task-order";
import { db } from "@/lib/db";

interface ListContainerProps {
  sprintId: string;
  data: ListWithTasks[];
  orgId: string;
}
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const ListContainer = ({
  sprintId,
  data,
  orgId,
}: ListContainerProps) => {
  const [lists, setLists] = useState<ListWithTasks[]>([]);
  const [sprintOrgId, setSprintOrgId] = useState<string | null>(null);

  const [orderedData, setOrderedData] = useState(data);
  // @ts-ignore
  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success(`List reordered`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  // @ts-ignore
  const { execute: executeUpdateTaskOrder } = useAction(updateTaskOrder, {
    onSuccess: () => toast.success("Task moved"),
    onError: (error) => toast.error(error),
  });

  useEffect(() => {
    // Fetch the orgId of the sprint when the component mounts
    const fetchSprintOrgId = async () => {
      const response = await fetch(`/api/sprint/${sprintId}`);
      const data = await response.json();
      if (data.orgId) {
        setSprintOrgId(data.orgId);
      }
    };

    fetchSprintOrgId();
  }, [sprintId]);

  useEffect(() => {
    setOrderedData(data);
  }, [data]);
  const onDDragEnd = (result: any): void => {
    const { destination, source, type } = result;
    if (!destination) {
      return;
    }
    /// If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // / user moves a list
    if (type === "list" && canEditSprint === true) {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );
      setOrderedData(items);
      executeUpdateListOrder({ items, sprintId }).then();
    }

    // User moves a Task
    if (type === "task" && canEditSprint === true) {
      let newOrderedData = [...orderedData];

      /// get source and destination list
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) {
        return;
      }

      /// Check if tasks exists on the source
      if (!sourceList.tasks) {
        sourceList.tasks = [];
      }
      /// Check if tasks exists on the destination
      if (!destList.tasks) {
        destList.tasks = [];
      }

      // moving the task in the same list
      if (source.droppableId === destination.droppableId) {
        const reorderedtasks = reorder(
          sourceList.tasks,
          source.index,
          destination.index
        );
        reorderedtasks.forEach((task, idx) => {
          task.order = idx;
        });
        sourceList.tasks = reorderedtasks;
        setOrderedData(newOrderedData);

        executeUpdateTaskOrder({
          sprintId: sprintId,
          items: reorderedtasks,
        }).then();

        /// user moves the tasks to another list
      } else {
        /// remove task from the source list
        const [movedtask] = sourceList.tasks.splice(source.index, 1);
        /// Assign new list id to the new task
        movedtask.listId = destination.droppableId;
        /// add task to destination list
        destList.tasks.splice(destination.index, 0, movedtask);
        sourceList.tasks.forEach((task, idx) => {
          task.order = idx;
        });

        /// update the order for a destination list
        destList.tasks.forEach((task, idx) => {
          task.order = idx;
        });
        setOrderedData(newOrderedData);
        executeUpdateTaskOrder({
          sprintId: sprintId,
          items: destList.tasks,
        }).then();
      }
    }
  };
  const canEditSprint = sprintOrgId === orgId; // Check if the orgId is available (this means the user is part of the org)

  return (
    <DragDropContext onDragEnd={onDDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => (
              <ListItem
                key={list.id}
                index={index}
                data={list}
                dataz={lists}
                can={canEditSprint}
              ></ListItem>
            ))}
            {provided.placeholder}
            {canEditSprint && <ListForm />}{" "}
            <div className="flex shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
