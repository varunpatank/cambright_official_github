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
import { Loader2, PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChaptersList } from "./chapters-list";
import { Chapter, Course } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  continueText?: string;
  additionalText?: string;
  continueButtonColor?: string;
}

const ConfirmModal = ({
  open,
  onClose,
  continueText = "Understood",
  additionalText = "",
  continueButtonColor = "bg-blue-500",
}: ConfirmModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {"Click the pen icon to edit chapter"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {additionalText ? additionalText : "Are you sure?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end mt-4">
          <AlertDialogAction
            onClick={onClose}
            className={`py-2 px-4 rounded-md text-white ${continueButtonColor}`}
          >
            {continueText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  const toggleCreating = () => setIsCreating((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters`, values);
      router.refresh();
      toast.success("Chapter Added!");
      reset({ title: "" });
      setShowConfirmModal(true);
      toggleCreating();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
        list: updateData,
      });
      toast.success("Chapters reordered");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/tutor/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="relative mt-6 bg-[#020817] rounded-md p-4 border">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-purple-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Course Chapters
        <Button
          onClick={toggleCreating}
          className={
            isCreating
              ? "hover:bg-n-7 bg-transparent"
              : "bg-n-7 hover:bg-transparent"
          }
        >
          {isCreating ? (
            <XIcon />
          ) : (
            <>
              <PlusCircle className="h-4 mr-2 w-4" />
              Add Chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              variant="tert"
            >
              {isSubmitting ? "Creating.." : "Create"}
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.chapters.length && "text-slate-500 italic"
          )}
        >
          {!initialData.chapters.length && "No chapters"}
          <ChaptersList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters || []}
          />
        </div>
      )}
      {initialData.chapters.length !== 0 && !isCreating && (
        <p className="text-xs text-muted-foreground mt-4 inline-flex">
          Drag and drop to reorder chapters
        </p>
      )}
      <ConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        continueText="Understood"
        additionalText={`You need to edit & publish at least one chapter!`}
        continueButtonColor="bg-emerald-700 hover:bg-emerald-900"
      />
    </div>
  );
};
