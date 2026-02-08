// v.0.0.01 salah

import { db } from "@/lib/db";
import Subjects from "../tutor/courses/_components/subjects";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";
import { StarryHeader } from "@/components/ui/starry-header";
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
      <div className="p-6">
        <StarryHeader 
          title="Browse *Courses*" 
          subtitle="Explore our comprehensive course library"
          intensity="medium"
        />
      </div>
      <div className="px-6 pt-2 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 pt-2">
        <Subjects items={subjects} />
        <CoursesList items={courses} prevImage={true} />
      </div>
    </>
  );
};

export default SearchPage;
