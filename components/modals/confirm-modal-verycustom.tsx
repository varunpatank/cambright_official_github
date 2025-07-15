// v0.0.01 salah

"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { stringOrDate } from "react-big-calendar";

interface ConfirmModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
  continueText?: string;
  additionalText?: string;
  continueButtonColor?: string;
  typeToContinue?: boolean;
  Title?: string;
  cannot?: boolean;
}

export const ConfirmModalVeryCustom = ({
  children,
  Title,
  onConfirm,
  continueText = "Continue",
  additionalText = "",
  continueButtonColor = "bg-blue-500",
  typeToContinue = false,
  cannot = true,
}: ConfirmModalProps) => {
  const [inputValue, setInputValue] = useState("");

  const isInputValid = inputValue.toUpperCase() === "DELETE";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle> {!Title ? "Sure?" : Title}</AlertDialogTitle>
          <AlertDialogDescription>
            {additionalText ? additionalText : "Are you sure?"}
          </AlertDialogDescription>
          <AlertDialogDescription className="text-red-500">
            {!cannot && "This action can not be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          {typeToContinue && (
            <input
              type="text"
              placeholder="type 'DELETE' to proceed"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="p-2 border rounded-md w-full mx-2" // Full width with margin left and right
            />
          )}
          <AlertDialogFooter className="flex justify-end mt-4">
            <div className="flex gap-2">
              <AlertDialogCancel className="px-4 py-2 rounded-md">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                disabled={!isInputValid && typeToContinue}
                className={`py-2 px-4 rounded-md text-white ${continueButtonColor}`}
              >
                {continueText}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
