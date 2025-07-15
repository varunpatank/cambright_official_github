// v.0.0.01 salah

import { db } from "@/lib/db";
import {
  Board,
  Chapter,
  Note,
  NoteBoard,
  NoteSubject,
  Subject,
} from "@prisma/client";
import { getProgress } from "./get-progress-notes";

type NoteWithProgressWithSubject = Note & {
  notesubject: NoteSubject | null;
  noteboard: NoteBoard | null;
  notechapters: { id: string; sessionlink: string }[];
  progress: number | null;
};

type DashboardNotes = {
  completedNotes: NoteWithProgressWithSubject[];
  NotesInProgress: NoteWithProgressWithSubject[];
};

export const getDashboardNotes = async (
  userId: string
): Promise<DashboardNotes> => {
  try {
    const enrolledNotes = await db.added.findMany({
      where: {
        userId: userId,
      },
      select: {
        note: {
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
          },
        },
      },
    });

    const notes: NoteWithProgressWithSubject[] = enrolledNotes.map(
      (enrollment) => {
        const note = enrollment.note;
        return {
          ...note,
          notesubject: note.notesubject || null,
          noteboard: note.noteboard || null,
          notechapters: note.notechapters.map((chapter) => ({
            id: chapter.id,
            sessionlink: chapter.sessionlink || "",
          })),
          progress: null,
        };
      }
    );

    for (let note of notes) {
      const progress = await getProgress(userId, note.id);
      note.progress = progress;
    }

    const completedNotes = notes.filter((note) => note.progress === 100);
    const NotesInProgress = notes.filter((note) => (note.progress ?? 0) < 100);
    return {
      completedNotes,
      NotesInProgress,
    };
  } catch {
    console.log("getdashboard error");
    return {
      completedNotes: [],
      NotesInProgress: [],
    };
  }
};
