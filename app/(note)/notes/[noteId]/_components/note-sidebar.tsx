// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  Chapter,
  Note,
  NoteChapter,
  NoteUserProgress,
  UserProgress,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { NoteSidebarItem } from "./note-sidebar-item";
import { NoteProgress } from "@/components/note-progress";

interface NoteSidebarProps {
  note: Note & {
    notechapters: (NoteChapter & {
      noteuserProgress: NoteUserProgress[] | null;
    })[];
  };
  progressCount: number;
}
export const NoteSidebar = async ({
  note,
  progressCount,
}: NoteSidebarProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const enrollment = await db.added.findUnique({
    where: {
      userId_noteId: {
        userId,
        noteId: note.id,
      },
    },
  });
  return (
    <>
      <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
        <div className="p-8 flex flex-col border-b">
          <h1 className="font-semibold">{note.title}</h1>
          {enrollment && (
            <div className="mt-10">
              <NoteProgress variant="success" value={progressCount} />
            </div>
          )}
        </div>
        <div className="flex flex-col w-full">
          {note.notechapters.map((chapter, index) => (
            <NoteSidebarItem
              key={chapter.id}
              id={chapter.id}
              label={chapter.title}
              isCompleted={!!chapter.noteuserProgress?.[0]?.isCompleted}
              isLocked={
                !enrollment &&
                !chapter.title.toLowerCase().includes("intr".toLowerCase())
              }
              noteId={note.id}
            />
          ))}
        </div>
      </div>
    </>
  );
};
