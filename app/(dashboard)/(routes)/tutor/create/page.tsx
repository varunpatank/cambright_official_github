// v.0.0.01 salah

"use client";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { useUser } from "@clerk/nextjs";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { useState } from "react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSearchSelect } from "@/components/user-search-select";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingOverlay from "@/components/LoadingOverlay";
import React from "react";
import { Crown } from "lucide-react";

// Update schema to include optional authorId
const formSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title" }),
  authorId: z.string().optional(),
});

interface UserSearchUser {
  id: string
  name: string
  email: string
  imageUrl?: string
  username?: string
}

const CreatePage = () => {
  const { user } = useUser();
  const { isSuperAdmin, isLoading: adminLoading } = useAdminStatus(user?.id);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<UserSearchUser | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      authorId: undefined,
    },
  });
  const confetti = useConfettiStore();

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Include authorId in the request if a custom author is selected
      const requestData = {
        title: values.title,
        ...(selectedAuthor && { authorId: selectedAuthor.id })
      };
      
      const response = await axios.post("/api/courses", requestData);
      toast.success("Course created!");
      router.push(`/tutor/courses/${response.data.id}`);
      confetti.onOpen();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorSelect = (author: UserSearchUser | null) => {
    setSelectedAuthor(author);
    form.setValue("authorId", author?.id || undefined);
  };

  if (adminLoading) {
    return <LoadingOverlay />;
  }

  return (
    <>
      {loading && <LoadingOverlay />}
      <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl mb-2">Name your Course</h1>
          <p className="text-sm text-slate-600 mb-6">
            What would you like to name your course?{" "}
            Don&apos;t worry, you can change that later!
          </p>

          {/* Superadmin Badge */}
          {isSuperAdmin && (
            <Card className="mb-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-600/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Crown className="h-5 w-5 mr-2 text-purple-400" />
                  Super Admin Privileges
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-400">
                  As a super admin, you can assign this course to any user as the author. 
                  Leave the author field empty to assign it to yourself.
                </p>
              </CardContent>
            </Card>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course title</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. 'Complete IGCSE Biology syllabus covered'"
                        {...field}
                        className="bg-n-7 border-n-6 text-n-1"
                      />
                    </FormControl>
                    <FormDescription>
                      What will you teach in this course?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author Selection - Only for Super Admins */}
              {isSuperAdmin && (
                <FormField
                  control={form.control}
                  name="authorId"
                  render={() => (
                    <FormItem>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <FormLabel>Course Author</FormLabel>
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/20">
                            Super Admin Only
                          </Badge>
                        </div>
                        <FormControl>
                          <UserSearchSelect
                            onUserSelect={handleAuthorSelect}
                            selectedUser={selectedAuthor}
                            placeholder="Search for a user to assign as author..."
                            label=""
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedAuthor 
                            ? `Course will be assigned to ${selectedAuthor.name}`
                            : "Leave empty to assign the course to yourself"
                          }
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center gap-x-2 pt-4">
                <Link href="/tutor/courses">
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
