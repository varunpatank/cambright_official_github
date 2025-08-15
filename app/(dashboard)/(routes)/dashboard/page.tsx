// v.0.0.02 - Revolutionized Dashboard

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardNotes } from "@/actions/get-dashboard-notes";
import { DashboardClient } from "./_components/dashboard-client";

export default async function Dashboard() {
  const { userId } = auth();
  if (!userId) {
    return redirect("/home");
  }
  
  const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);
  const { completedNotes, NotesInProgress } = await getDashboardNotes(userId);

  return (
    <DashboardClient 
      userId={userId}
      coursesData={{
        completed: completedCourses.length,
        inProgress: coursesInProgress.length
      }}
      notesData={{
        completed: completedNotes.length,
        inProgress: NotesInProgress.length
      }}
    />
  );
}
