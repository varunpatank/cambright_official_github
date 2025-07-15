"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTaskModal } from "@/hooks/use-task-modal";
import { useQuery } from "@tanstack/react-query";
import { TaskWithList } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { TaskHeader } from "./header";
import { TaskDescription } from "./description";
import { TaskActions } from "./actions";
import { AuditLog } from "@prisma/client";
import { Activity } from "./activity";

export const TaskModal = () => {
  const id = useTaskModal((state) => state.id);

  const isOpen = useTaskModal((state) => state.isOpen);
  const onClose = useTaskModal((state) => state.onClose);
  const { data: taskData } = useQuery<TaskWithList>({
    queryKey: ["task", id],
    queryFn: () => fetcher(`/api/tasks/${id}`),
  });
  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["task-logs", id],
    queryFn: () => fetcher(`/api/tasks/${id}/logs`),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {!taskData ? <TaskHeader.Skeleton /> : <TaskHeader data={taskData} />}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {!taskData ? (
                <TaskDescription.Skeleton />
              ) : (
                <TaskDescription data={taskData} />
              )}
              {!auditLogsData ? (
                <Activity.Skeleton />
              ) : (
                <Activity items={auditLogsData} />
              )}
            </div>
          </div>
          {!taskData ? (
            <TaskActions.Skeleton />
          ) : (
            <TaskActions data={taskData} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
