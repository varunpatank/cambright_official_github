"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Layout } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { FormInput } from "../../form/form-input";
import { Skeleton } from "@/components/ui/skeleton";

import { TaskWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateTask } from "@/actions/update-task";
import { toast } from "react-hot-toast";

interface TaskHeaderProps {
  data: TaskWithList;
}
export const TaskHeader = ({ data }: TaskHeaderProps) => {
  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState(data.title);
  const queryClient = useQueryClient();
  const params = useParams();

  // @ts-ignore
  const { execute } = useAction(updateTask, {
    onSuccess: (data) => {
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
      toast.success(`renamed to "${data.title}"`);
      // @ts-ignore
      setTitle(data.title);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const sprintId = params?.sprintId as string;
    if (title === data.title) {
      return;
    }
    console.log("title in submit", title);
    execute({ title, sprintId, id: data.id }).then();
  };
  return (
    <div className="flex items-start gap-x-3 mb-6 w-full">
      <Layout className="h-5 w-5 mt-1 text-neutral-700" />
      <div className="w-full">
        <form action={onSubmit}>
          <FormInput
            id="title"
            ref={inputRef}
            defaultValue={title}
            onBlur={onBlur}
            className="font-semibold text-xl px-1 text-neutral-700 bg-transparent border-transparent relative -left-1.5 w-[95%] focus-visible:bg-n-8 focus-visible:border-input mb-0.5 truncate"
          />
        </form>
        <p className="text-sm text-muted-foreground">
          in list <span className="underline">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

TaskHeader.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div className="">
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};
