// v.0.0.01 salah

"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";

import {
  Form,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingOverlay from "@/components/LoadingOverlay"; // Adjust the import path as necessary
import React from "react";

const formSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title" }),
});

const CreatePage = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false); // State to manage the loading overlay

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  const confetti = useConfettiStore();

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true); // Show loading overlay
    try {
      const response = await axios.post("/api/notes", values);
      toast.success("Notes created!");
      router.push(`/tutor/notes/${response.data.id}`);
      confetti.onOpen();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(true);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}{" "}
      {/* Conditionally render the loading overlay */}
      <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
        <div>
          <h1 className="text-2xl">What Subject? </h1>
          <p className="text-sm text-slate-600">
            Dont&apos; worry you can edit everything later
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. 'IGCSE Biology Extended'"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What subject are you planning to make notes for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Link href="/tutor/notes">
                  <Button type="button" variant={"ghost"}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant={"tert"}
                  disabled={!isValid || isSubmitting}
                >
                  {loading ? "Creating..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CreatePage;
