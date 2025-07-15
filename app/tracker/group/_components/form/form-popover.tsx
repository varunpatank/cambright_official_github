"use client";
import React, { useRef, useState, useEffect } from "react";
import { useAction } from "@/hooks/use-action";
import { createSprintz } from "@/actions/create-sprint";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover-new";
import { FormInput } from "./form-input";
import { FormSubmit } from "./form-submit";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FormPicker } from "./form-picker";
import { Hint } from "../hint";

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  template?: boolean;
}

export const FormPopover = ({
  children,
  side = "bottom",
  template = false,
  align,
  sideOffset = 0,
}: FormPopoverProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  // @ts-ignore
  const { execute, fieldErrors } = useAction(createSprintz, {
    onSuccess: (data) => {
      toast.success(`Sprint ${data.title} created`);
      closeRef.current?.click();
      // @ts-ignore
      router.push(`/tracker/sprint/${data.id}`);
    },
    onError: (error) => {
      toast.error("error");
    },
  });

  const onSubmit = (formData: FormData) => {
    const title: string = formData.get("title") as string;
    const image: string = formData.get("image") as string;
    execute({ title, image, template }).then();
  };

  // State to manage the dynamic 'side' based on window size
  const [popoverSide, setPopoverSide] = useState<
    "left" | "right" | "top" | "bottom"
  >("bottom");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPopoverSide("top"); // On small screens, popover appears on top
      } else {
        setPopoverSide("right"); // On larger screens, popover appears on the right
      }
    };

    handleResize(); // Initial check

    // Event listener to update the side when window resizes
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={popoverSide} // Use the dynamically calculated popoverSide
        sideOffset={sideOffset}
        className="w-80 pt-3"
      >
        <div className="font-medium text-center pb-4 flex justify-center items-center">
          Create Sprint
        </div>

        <PopoverClose asChild ref={closeRef}>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 text-gray-400"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <form className="space-y-4" action={onSubmit}>
          <div className="space-y-4">
            <div>
              <FormPicker id="image" errors={fieldErrors} />{" "}
            </div>
            <FormInput
              className="h-9"
              id="title"
              label="Sprint title"
              type="text"
              errors={fieldErrors}
            />
          </div>
          <FormSubmit className="w-full h-8 text-sm" variant="tert">
            Create
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};
