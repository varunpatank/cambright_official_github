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
import { Note } from "@prisma/client";

interface AttachmentlinkFormProps {
  initialData: Note;
  noteId: string;
}
const formSchema = z.object({
  noteattachmentLink: z.string().min(1, { message: "optional" }),
});
export const AttachmentlinkForm = ({
  initialData,
  noteId,
}: AttachmentlinkFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noteattachmentLink: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/notes/${noteId}`, values);
      router.refresh();
      toast.success("Links updated!");
      toggleEdit();
    } catch {
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        External Links
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
            !initialData.attachmentLink && "text-slate-500 italic"
          )}
        >
          {initialData.attachmentLink || "No Links"}
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
              name="noteattachmentLink"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      // className="text-neutral-950"
                      disabled={isSubmitting}
                      placeholder="Link any resources here, 
                      e.g. 'Google Drive, Dropbox links: Lesson1.pdf '"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />{" "}
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
