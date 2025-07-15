// v.0.0.01 salah

import { Subject, Note, Board, NoteSubject, NoteBoard } from "@prisma/client";
import { getProgress } from "./get-progress-notes";
import { db } from "@/lib/db";

type NoteWithProgressWithSubject = Note & {
  notesubject: NoteSubject | null;
  noteboard: NoteBoard | null;
  notechapters: { id: string; sessionlink: string }[]; // sessionlink is non-nullable
  progress: number | null;
};

type GetNotes = {
  userId: string;
  title?: string;
  notesubjectId?: string;
};

export const getNotes = async ({
  userId,
  title,
  notesubjectId,
}: GetNotes): Promise<NoteWithProgressWithSubject[]> => {
  try {
    const notes = await db.note.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        notesubjectId,
      },
      include: {
        notesubject: true,
        noteboard: true,
        notechapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            sessionlink: true,
          },
        },
        added: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const notesWithProgress: NoteWithProgressWithSubject[] = await Promise.all(
      notes.map(async (note) => {
        const progressPercent =
          note.added.length === 0 ? null : await getProgress(userId, note.id);

        const sanitizedChapters = note.notechapters
          .filter((notechapter) => notechapter.sessionlink !== null)
          .map((notechapter) => ({
            id: notechapter.id,
            sessionlink: notechapter.sessionlink as string,
          }));

        return {
          ...note,
          notechapters: sanitizedChapters,
          progress: progressPercent,
        };
      })
    );

    return notesWithProgress;
  } catch (error) {
    console.log("cant get Notes", error);
    return [];
  }
};
