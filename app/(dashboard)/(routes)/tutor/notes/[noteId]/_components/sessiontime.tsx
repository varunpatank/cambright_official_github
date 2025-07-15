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
import { CalendarClock, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DatePickerWithPresets } from "@/components/ui/datepicker";
import { parse } from "date-fns";
import Link from "next/link";

interface SessiontimeFormProps {
  initialData: {
    sessiondate?: string | null;
    sessiontime?: string;
  };
  noteId: string;
}

const formSchema = z.object({
  sessiondate: z.string().min(1),
  sessiontime: z.string().min(1),
});

export const SessiontimeForm = ({
  initialData,
  noteId,
}: SessiontimeFormProps) => {
  const initialDateString = initialData.sessiondate || "";
  const initialDate = initialDateString
    ? parse(initialDateString, "dd-MM-yyyy", new Date())
    : undefined;

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessiondate: initialData.sessiondate || "",
      sessiontime: initialData.sessiontime || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/notes/${noteId}`, values);
      router.refresh();
      toast.success("Meeting Date updated!");
      toggleEdit();
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error updating meeting date:", error);
    }
  };
  return (
    <div className="mt-6 bg-[#020817] rounded-md p-4 border">
      <div className="font-medium flex items-center justify-between">
        Meeting Date
        <Button
          onClick={toggleEdit}
          className={
            isEditing
              ? "hover:bg-n-7 bg-transparent"
              : "bg-n-7 hover:bg-transparent"
          }
        >
          {isEditing ? (
            <XIcon />
          ) : (
            <>
              <CalendarClock className="h-4 mr-2 w-4" />
              Schedule
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.sessiondate && "text-slate-500 italic"
          )}
        >
          {initialData.sessiondate || "No date"}
          <br />
          {initialData.sessiontime || "No Time"}
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
              name="sessiondate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePickerWithPresets
                      onDateChange={(dateString) =>
                        form.setValue("sessiondate", dateString)
                      }
                      initialValue={initialDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <hr className="py-2 border-t border-gray-500" />
            <div className="space-y-4">
              <h2>Meeting time</h2>
              <FormField
                control={form.control}
                name="sessiontime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. 01:00 UTC"
                        {...field} // Ensure field properties are spread onto Input
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Pls write time as UTC &quot;HH:MM UTC&quot;
                <span>
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-blue-400 opacity-50 underline"
                    href="https://www.google.com/search?q=my+time+to+utc&sca_esv=ae95a0e0aab0d175&sca_upv=1&rlz=1C5CHFA_enKW1063KW1063&ei=qAuoZojJKtD-7_UP5Z7AyQ0&ved=0ahUKEwiIvZvfms2HAxVQ_7sIHWUPMNkQ4dUDCBA&oq=my+time+to+utc&gs_lp=Egxnd3Mtd2l6LXNlcnAiDm15IHRpbWUgdG8gdXRjMgYQABgHGB4yCxAAGIAEGJECGIoFMgUQABiABDILEAAYgAQYkQIYigUyBRAAGIAEMgUQABiABDIEEAAYHjIEEAAYHjIGEAAYBRgeMgYQABgIGB5I1CVQ6AxYrQ9wA3gBkAEAmAGPAqABgAaqAQMyLTO4AQzIAQD4AQGYAgSgAooCwgIKEAAYsAMY1gQYR8ICDRAAGIAEGLADGEMYigWYAwCIBgGQBgqSBwUzLjAuMaAH4xA&sclient=gws-wiz-serp"
                  >
                    Your time to UTC
                  </Link>
                </span>
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
