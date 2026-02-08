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
      <div className="p-6">
        <StarryBackground height="140px" intensity="medium">
          <div className="flex items-center justify-center h-full py-6">
            <Cover className="inline-block px-8 py-4 bg-neutral-900/60 rounded-xl">
              <h1 className="text-3xl md:text-4xl font-sora font-bold text-white text-center">
                Browse <span className="text-purple-400">Courses & Notes</span>
              </h1>
            </Cover>
          </div>
        </StarryBackground>
      </div>

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
