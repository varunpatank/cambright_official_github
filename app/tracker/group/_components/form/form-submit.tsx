"use client";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

interface FormSubmitProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "tert";
}

export const FormSubmit = ({
  children,
  disabled,
  className,
  variant,
}: FormSubmitProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      size={"sm"}
      variant={variant}
      className={className}
      disabled={pending || disabled}
      type="submit"
    >
      {children}
    </Button>
  );
};
