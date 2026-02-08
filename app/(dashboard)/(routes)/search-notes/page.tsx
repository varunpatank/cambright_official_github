// In SearchPage.tsx
import { db } from "@/lib/db";
import { getNotes } from "@/actions/get-notes";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NotesList } from "@/components/notes-list";
import Subjects from "../tutor/notes/_components/subjects";
import { SearchInput } from "@/components/search-input";
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

  // Fetch subjects and notes
  const subjects = await db.noteSubject.findMany();
  const notes = await getNotes({
    userId,
    title: searchParams.title,
    notesubjectId: searchParams.subjectId,
  });

  return (
    <>
      <div className="p-6">
        <StarryHeader 
          title="Browse *Notes*" 
          subtitle="Explore our premium revision notes"
          intensity="medium"
        />
      </div>
      <div className="px-6 pt-2 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 pt-2">
        <Subjects items={subjects} />
        <NotesList items={notes} prevImage={true} />
      </div>
    </>
  );
};

export default SearchPage;
