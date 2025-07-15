"use client";

import React, { ElementRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { Plus, X } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { createList } from "@/actions/create-list";
import { FormInput } from "@/app/tracker/group/_components/form/form-input";
import { FormSubmit } from "@/app/tracker/group/_components/form/form-submit";
import { Button } from "@/components/ui/button";
import { ListWrapper } from "./list-wrapper";
import { toast } from "react-hot-toast";

export const ListForm = () => {
  const params = useParams();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const enableEditing = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };
  const disableEditing = () => {
    setEditing(false);
  };
  const { execute, fieldErrors } = useAction(createList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" created`);
      disableEditing();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const sprintId = formData.get("sprintId") as string;

    execute({
      title,
      sprintId,
    }).then();
  };
  if (editing) {
    return (
      <ListWrapper>
        <form
          className="w-full p-3 rounded-md bg-n-7 space-y-4 shadow-md"
          ref={formRef}
          action={onSubmit}
        >
          <FormInput
            ref={inputRef}
            id="title"
            errors={fieldErrors}
            className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-n-6 focus:border-n-6 transition"
            placeholder="Enter title"
          />
          <input hidden value={params?.sprintId} name="sprintId" readOnly />
          <div className="flex items-center gap-x-1">
            <FormSubmit variant="tert">Add List</FormSubmit>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }
  return (
    <div>
      <ListWrapper>
        <button
          onClick={enableEditing}
          className="w-full rounded-md bg-n-7/80 hover:bg-n-7/50 transition p-3 flex items-center font-medium text-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Add a List
        </button>
      </ListWrapper>
    </div>
  );
};
