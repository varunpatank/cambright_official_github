"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TaskWithList } from "@/types";
import { Button } from "@/components/ui/button";
import { Copy, Trash } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { copyTask } from "@/actions/copy-task";
import { toast } from "react-hot-toast";
import { deleteTask } from "@/actions/delete-task";
import { useParams } from "next/navigation";
import { useTaskModal } from "@/hooks/use-task-modal";

interface TaskActionsProps {
  data: TaskWithList;
}
export const TaskActions = ({ data }: TaskActionsProps) => {
  const params = useParams();
  const sprintId = params?.sprintId as string;
  const taskModal = useTaskModal();
  const { execute: executeCopyTask, isLoading: isLoadingCopyTask } = useAction(
    // @ts-ignore
    copyTask,
    {
      onSuccess: (): void => {
        toast.success(`Task Duplicated!`);
        taskModal.onClose();
      },
      onError: (error) => toast.error(error),
    }
  );

  const { execute: executeDeleteTask, isLoading: isLoadingDeleteTask } =
    // @ts-ignore
    useAction(deleteTask, {
      onSuccess: (): void => {
        toast.success(`Task deleted`);
        taskModal.onClose();
      },
      onError: (error) => toast.error(error),
    });
  const onCopy = () => {
    executeCopyTask({ id: data.id, sprintId }).then();
  };
  const onDelete = () => {
    executeDeleteTask({ id: data.id, sprintId }).then();
  };
  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-semibold">Actions</p>
      <Button
        variant="default"
        className="w-full justify-start"
        size="inline"
        onClick={onCopy}
        disabled={isLoadingCopyTask}
      >
        <Copy className="w-4 h-4 mr-2" />
        Dupe
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="w-full justify-start"
        disabled={isLoadingDeleteTask}
        onClick={onDelete}
      >
        <Trash className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};

TaskActions.Skeleton = function ActionsSkeleton() {
  return (
    <div className={"space-y-2 mt-2"}>
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
    </div>
  );
};
