// v.0.0.01 salah

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const NoteIdPage = async ({ params }: { params: { noteId: string } }) => {
  const note = await db.note.findUnique({
    where: {
      id: params.noteId,
    },
    include: {
      notechapters: {
        where: {
          isPublished: true,
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

  if (note.notechapters.length > 0) {
    return redirect(`/notes/${note.id}/chapters/${note.notechapters[0].id}`);
  } else {
    return null;
  }
};

export default NoteIdPage;
