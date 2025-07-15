// v.0.0.01 salah

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from ".././_components/info-card";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { FaSpinner } from "react-icons/fa6";
import { getUserFirstName } from "@/lib/clerkername";
import Link from "next/link";
// export const maxDuration = 300;

export default async function Dashboard() {
  // const profile = await initialProfile();
  const { userId } = auth();
  if (!userId) {
    return redirect("/home");
  }
  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );
  const allCourses = [...coursesInProgress, ...completedCourses];

  return (
    <div className="p-6 space-y-6">
      <Link
        href={`/dashboard`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to dashboard
      </Link>
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
      {allCourses.length > 0 ? (
        <CoursesList
          items={[...coursesInProgress, ...completedCourses]}
          prevImage={true}
        />
      ) : (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/nocourses.svg"
              height={400}
              width={400}
              alt="no courses found"
              className="mt-9"
            />
          </div>
          <h1 className="mt-6 text-2xl font-medium tracking-tight text-white sm:text-4xl">
            You haven&apos;t enrolled in any courses
          </h1>
          <a
            className="group relative inline-flex items-center overflow-hidden rounded bg-purple-600 px-8 py-3 text-white focus:outline-none focus:ring active:bg-indigo-500 m-5"
            href="/search"
          >
            <span className="absolute -end-full transition-all group-hover:end-4">
              <svg
                className="size-5 rtl:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
            <span className="text-sm font-medium transition-all group-hover:me-4">
              Browse
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
