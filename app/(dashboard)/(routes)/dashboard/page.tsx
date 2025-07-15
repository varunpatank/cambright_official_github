// v.0.0.01 salah

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth } from "@clerk/nextjs/server";
import {
  CheckCircle,
  Clock,
  NotebookPen,
  SquareArrowUpRight,
  TvMinimalPlay,
} from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";
import Image from "next/image";
import { initialAccount } from "@/lib/initial-account";

import { useUser } from "@clerk/nextjs";
import { FaSpinner } from "react-icons/fa6";
import { getUserFirstName } from "@/lib/clerkername";
import { LearnButton } from "@/components/ui/learnbutton";
import Link from "next/link";
import { getDashboardNotes } from "@/actions/get-dashboard-notes";
import { InfoCardNotes } from "./_components/info-card-notes";
import { Button } from "@/components/ui/button";
import { IconChecklist } from "@tabler/icons-react";
// export const maxDuration = 300;

export default async function Dashboard() {
  const account = await initialAccount();
  const { userId } = auth();
  if (!userId) {
    return redirect("/home");
  }
  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );
  const { completedNotes, NotesInProgress } = await getDashboardNotes(userId);
  const allCourses = [...coursesInProgress, ...completedCourses];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl ">
        Welcome{" "}
        <span className="text-purple-400">{getUserFirstName(userId)}</span>!
      </h1>
      <div className="  p-4 rounded-md">
        <h1 className="text-2xl mb-4">
          <span>
            <TvMinimalPlay className="inline mr-3 size-8" />
          </span>
          Courses
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label={"In Progress"}
            numberOfItems={coursesInProgress.length}
          />
          <InfoCard
            icon={CheckCircle}
            label={"Completed"}
            numberOfItems={completedCourses.length}
            variant="success"
          />{" "}
        </div>
      </div>{" "}
      <div className=" p-4 rounded-md">
        <h1 className="text-2xl mb-4">
          <span>
            <NotebookPen className="inline mr-3 size-8" />
          </span>
          Notes
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCardNotes
            icon={Clock}
            label={"In Progress"}
            numberOfItems={NotesInProgress.length}
          />
          <InfoCardNotes
            icon={CheckCircle}
            label={"Completed"}
            numberOfItems={completedNotes.length}
            variant="success"
          />{" "}
        </div>
      </div>{" "}
      <div className=" p-4 pt-0 rounded-md">
        <Link href="/dashboard/mycourses">
          <Button
            className="mb-2 mr-3 md:mr-5 hover:scale-110 transition-all"
            variant="tert"
          >
            Courses
          </Button>
        </Link>{" "}
        <Link href="/dashboard/mynotes">
          <Button
            className="mb-2 hover:scale-110 transition-all mr-3 md:mr-5"
            variant="tert"
          >
            Notes
          </Button>
        </Link>
        <Link href="/tracker/select-group">
          <Button
            className="mb-2 hover:scale-110 transition-all mr-3 md:mr-5"
            variant="tert"
          >
            Progress Tracker
          </Button>
        </Link>{" "}
        <Link href="/profile">
          <Button
            className="mb-2 hover:scale-110 transition-all"
            variant="tert"
          >
            Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
