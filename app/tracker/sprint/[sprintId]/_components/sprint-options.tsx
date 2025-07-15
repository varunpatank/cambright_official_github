"use client";
import React from "react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover-new";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, X } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import toast from "react-hot-toast";
import { deleteSprint } from "@/actions/delete-sprint";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface SprintOptionsProps {
  id: string;
}
export const SprintOptions = ({ id }: SprintOptionsProps) => {
  const { execute, isLoading } = useAction(deleteSprint, {
    onError: (error) => {
      toast.error(error);
    },
  });
  const onDelete = () => {
    execute({ id }).then();
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2 bg-transparent">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pt-3 pb-3" side="bottom" align="start">
        <div className="text-sm font-medium text-center text-neutral-600 pb-8"></div>
        <PopoverClose asChild>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 -w-4" />
          </Button>
        </PopoverClose>
        <ConfirmModal
          onConfirm={onDelete}
          continueText="Delete"
          additionalText={`Are you sure you want to delete sprint?`}
          continueButtonColor="bg-rose-600/80 hover:bg-rose-800/80"
          typeToContinue={true}
        >
          <Button
            variant="ghost"
            disabled={isLoading}
            className="text-red-500 rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm"
          >
            <Trash className="inline w-5 h-5 mr-1" /> Delete Sprint
          </Button>
        </ConfirmModal>
      </PopoverContent>
    </Popover>
  );
};
