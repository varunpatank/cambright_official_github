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
import { Link, Pencil, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Chapter } from "@prisma/client";
import { DatePickerWithPresets } from "@/components/ui/datepicker";

interface ChapterSessionLinkFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}
const formSchema = z.object({
  sessionlink: z.string().min(1),
});
export const ChapterSessionLinkForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterSessionLinkFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => {
    setIsEditing((current) => !current);
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionlink: initialData?.sessionlink || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      router.refresh();
      toast.success("Meeting Link updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        Meeting link
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
              <Link className="h-4 mr-2 w-4" />
              Add link
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.sessionlink && "text-slate-500 italic"
          )}
        >
          {initialData.sessionlink || "No meeting"}
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
              name="sessionlink"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      // className="text-neutral-950"
                      disabled={isSubmitting}
                      placeholder="Enter your online meeting link if there's.."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <div>
              {" "}
              <p className="text-sm text-slate-500">
                e.g. zoom.us, google meet, ms teams
              </p>
            </div>

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
