"use client";
import React, { ElementRef, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sprint } from "@prisma/client";
import { FormInput } from "@/app/tracker/group/_components/form/form-input";
import { useAction } from "@/hooks/use-action";
import toast from "react-hot-toast";
import { updateSprint } from "@/actions/update-sprint";

interface SprintTitleFormProps {
  data: Sprint;
  can: boolean;
}
export const SprintTitleForm = ({ can, data }: SprintTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState<string>(data.title);
  const { execute } = useAction(updateSprint, {
    onSuccess: (data) => {
      toast.success(`Sprint "${data.title}" updated`);
      setTitle(data.title);
      disableEditing();
    },
    onError: (error) => toast.error("error"),
  });
  const enableEditing = () => {
    {
      can && setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  };
  const disableEditing = () => {
    setIsEditing(false);
  };
  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    execute({ title, id: data.id }).then();
  };
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };
  if (isEditing) {
    return (
      <form
        className="flex items-center gap-x-2"
        ref={formRef}
        action={onSubmit}
      >
        <FormInput
          id="title"
          onBlur={onBlur}
          ref={inputRef}
          defaultValue={title}
          className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none"
        />
      </form>
    );
  }
  return (
    <Button
      className="font-bold   text-lg h-auto w-auto p-1 px-2 bg-transparent "
      variant="default"
      onClick={enableEditing}
    >
      {title}
    </Button>
  );
};
