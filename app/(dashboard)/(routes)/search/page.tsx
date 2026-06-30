import { db } from "@/lib/db";
import Subjects from "../tutor/courses/_components/subjects";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";
import { NotesList } from "@/components/notes-list";
import { getNotes } from "@/actions/get-notes";
import { SquareArrowUpRight } from "lucide-react";
import Link from "next/link";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";

interface SearchPageProps {
  searchParams: {
    title: string;
    subjectId: string;
  };
}
// export const maxDuration = 300;

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId }: { userId: string | null } = await auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const subjects = await db.subject.findMany();

  const courses = await getCourses({
    userId,
    ...searchParams,
  });

  const notes = await getNotes({
    userId,
    ...searchParams,
  });

  return (
    <>
      {/* Starry Header */}
      <StarryBackground height="240px" intensity="medium" showMeteors={true} className="rounded-none mb-6">
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
          <Cover className="inline-block px-8 py-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sora text-center">
              Browse <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.7)]">Courses & Notes</span>.
            </h1>
            <p className="text-gray-400 text-center">Explore courses, revision notes and study resources</p>
          </Cover>
        </div>
      </StarryBackground>

      <div className="px-6 pt-2 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 pt-2">
        <Subjects items={subjects} />

        {/* Courses Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold  mb-4">
            Courses{" "}
            <span>
              <Link
                href={"/search-courses"}
                className="text-purple-200 hover:text-purple-400 transition-all"
              >
                <SquareArrowUpRight className="inline ml-2 size-6" />
              </Link>
            </span>
          </h2>
          <CoursesList items={courses} prevImage={false} />
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold  mb-4">
            Notes{" "}
            <span>
              <Link
                href={"/search-notes"}
                className="text-purple-200 hover:text-purple-400 transition-all"
              >
                <SquareArrowUpRight className="inline ml-2 size-6" />
              </Link>
            </span>
          </h2>
          <NotesList items={notes} prevImage={false} />
        </div>
      </div>
    </>
  );
};

export default SearchPage;
