// In SearchPage.tsx
import { db } from "@/lib/db";
import { getNotes } from "@/actions/get-notes";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NotesList } from "@/components/notes-list";
import Subjects from "../tutor/notes/_components/subjects";
import { SearchInput } from "@/components/search-input";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
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
      <StarryBackground height="240px" intensity="medium" showMeteors={true} className="rounded-none mb-6">
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
          <Cover className="inline-block px-8 py-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sora text-center">
              Revision <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(192,132,252,0.7)]">Notes</span>.
            </h1>
            <p className="text-gray-400 text-center">Explore our premium revision notes</p>
          </Cover>
        </div>
      </StarryBackground>
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
