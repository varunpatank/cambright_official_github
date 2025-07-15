// v.0.0.01 salah

import { getProgress } from "@/actions/get-progress-notes";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoteSidebar } from "./_components/note-sidebar";
import { NoteNavbar } from "./_components/note-navbar";
import { cn } from "@/lib/utils";

const NoteLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { noteId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const note = await db.note.findUnique({
    where: {
      id: params.noteId,
    },
    include: {
      notechapters: {
        where: {
          isPublished: true,
        },
        include: {
          noteuserProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!note) {
    return redirect("/search");
  }

  const progressCount = await getProgress(userId, note.id);
  const isChaptered = note.notechapters.length > 0;
  return (
    <div className="h-full">
      <div
        className={cn(
          isChaptered
            ? "h-[80px] md:pl-80 fixed inset-y-0 w-full z-50"
            : "h-[80px] md:pl-0 fixed inset-y-0 w-full z-50"
        )}
      >
        <NoteNavbar note={note} progressCount={progressCount} />
      </div>
      {isChaptered && (
        <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
          <NoteSidebar note={note} progressCount={progressCount} />
        </div>
      )}
      <main className="h-full md:pl-80 pt-[80px]">{children}</main>
    </div>
  );
};
export default NoteLayout;
