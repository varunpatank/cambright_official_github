// v.0.0.01 salah

"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MousePointerClick, Pencil, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@prisma/client";
import { Combobox } from "@/components/ui/combobox";
import { Boardobox } from "@/components/ui/boardobox";

interface BoardFormProps {
  initialData: Course;
  courseId: string;
  options: { label: string; value: string }[];
}
const formSchema = z.object({
  boardId: z.string().min(1),
});
export const BoardForm = ({
  initialData,
  courseId,
  options,
}: BoardFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      boardId: initialData?.boardId || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      router.refresh();
      toast.success("Board updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };
  const selectedOption = options.find(
    (option) => option.value === initialData.boardId
  );
  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        Board
        <Button
          onClick={toggleEdit}
          className={
            isEditing
              ? "hover:bg-n-7 bg-transparent"
              : "bg-n-7 hover:bg-transparent"
          }
        >
          {isEditing ? (
            <>
              <XIcon />
            </>
          ) : (
            <>
              <MousePointerClick className="h-4 mr-2 w-4" />
              Change
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.boardId && "text-slate-500 italic"
          )}
        >
          {selectedOption?.label || "Choose Board"}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Boardobox
                      options={options}
                      value={field.value}
                      onChange={field.onChange} // Correctly passing onChange
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                variant="tert"
              >
                {isSubmitting ? "Saving.." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
