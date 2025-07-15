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

interface ConfirmModalEnrollProps {
  children: React.ReactNode;
  onConfirm: () => void;
  continueText?: string;
  additionalText?: string;
  continueButtonColor?: string;
  typeToContinue?: boolean;
}

export const ConfirmModalEnroll = ({
  children,
  onConfirm,
  continueText = "Continue",
  additionalText = "",
  continueButtonColor = "bg-blue-500",
  typeToContinue = false,
}: ConfirmModalEnrollProps) => {
  const [inputValue, setInputValue] = useState("");

  const isInputValid = inputValue.toUpperCase() === "DISENROLLME";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle> {"Sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {additionalText ? additionalText : "Are you sure?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          {typeToContinue && (
            <input
              type="text"
              placeholder="type 'DISENROLLME' to proceed"
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
                disabled={!isInputValid}
                className={`py-2 px-4 rounded-md text-white ${continueButtonColor} md:mt-0 mt-2`}
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
