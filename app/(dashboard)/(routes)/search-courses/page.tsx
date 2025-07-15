// v.0.0.01 salah

import { db } from "@/lib/db";
import Subjects from "../tutor/courses/_components/subjects";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";
// export const maxDuration = 300;

interface SearchPageProps {
  searchParams: {
    title: string;
    subjectId: string;
  };
}
const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const subjects = await db.subject.findMany();

  const courses = await getCourses({
    userId,
    ...searchParams,
  });
  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6">
        <Subjects items={subjects} />
        <CoursesList items={courses} prevImage={true} />
      </div>
    </>
  );
};

export default SearchPage;
