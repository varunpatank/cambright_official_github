// v0.0.01 salah

"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useState } from "react";

interface ConfirmModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
  continueText?: string;
  additionalText?: string;
  continueButtonColor?: string;
  typeToContinue?: boolean;
}

export const ConfirmModal = ({
  children,
  onConfirm,
  continueText = "Continue",
  additionalText = "",
  continueButtonColor = "bg-blue-500",
  typeToContinue = false,
}: ConfirmModalProps) => {
  const [inputValue, setInputValue] = useState("");

  const isInputValid = inputValue.toUpperCase() === "DELETE";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"Sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {additionalText ? additionalText : "Are you sure?"}
          </AlertDialogDescription>
          <AlertDialogDescription className="text-red-500">
            {"This action can not be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          {typeToContinue && (
            <input
              type="text"
              placeholder="Type 'DELETE' to proceed"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="p-2 border rounded-md w-full mx-2" // Full width with margin left and right
            />
          )}
          <div className="flex justify-end mt-4">
            <AlertDialogAction
              onClick={onConfirm}
              className={`py-2 px-4 rounded-md text-white ${continueButtonColor}`}
            >
              {continueText}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
