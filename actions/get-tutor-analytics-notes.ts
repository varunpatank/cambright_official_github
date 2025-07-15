// v.0.0.01 salah

import { db } from "@/lib/db";
import { Added, Note, Enrollment, UserProgress } from "@prisma/client";
import { getUsersFirstNames } from "@/lib/clerkername";

type UserDetails = {
  fullname: string | null;
  username: string | null;
  imageUrl: string | null;
  email: string | null;
  lastActiveAt: Date | null;
};

type EnrollmentWithNote = Added & {
  note: Note;
};

const groupByNote = (enrollments: EnrollmentWithNote[]) => {
  const grouped: { [noteTitle: string]: number } = {};
  enrollments.forEach((enrollment) => {
    const noteTitle = enrollment.note.title;
    if (!grouped[noteTitle]) {
      grouped[noteTitle] = 0;
    }
    grouped[noteTitle] += 1;
  });
  return grouped;
};

export const getNoteAnalytics = async (userId: string) => {
  try {
    const enrollments = await db.added.findMany({
      where: {
        note: { userId: userId },
      },
      include: {
        note: {
          include: {
            notechapters: true,
          },
        },
      },
    });

    const uniqueStudentIds: Set<string> = new Set();
    enrollments.forEach((enrollment) => {
      uniqueStudentIds.add(enrollment.userId);
    });

    const studentIds = Array.from(uniqueStudentIds);
    const noteuserNames = await getUsersFirstNames(studentIds);

    const progressData = await db.noteUserProgress.findMany({
      where: { userId: { in: studentIds } },
      include: { notechapter: { include: { note: true } } },
    });

    const enrolledNotesCount: Record<string, number> = {};
    const userNotes: Record<string, { title: string; progress: number }[]> = {};

    enrollments.forEach((enrollment) => {
      const { userId, note } = enrollment;
      if (!enrolledNotesCount[userId]) {
        enrolledNotesCount[userId] = 0;
        userNotes[userId] = [];
      }
      enrolledNotesCount[userId] += 1;

      const noteChapters = note.notechapters.length;
      const completedChapters = progressData.filter(
        (p) =>
          p.notechapter.noteId === note.id &&
          p.userId === userId &&
          p.isCompleted
      ).length;

      const progressPercentage =
        noteChapters > 0 ? (completedChapters / noteChapters) * 100 : 0;

      userNotes[userId].push({
        title: note.title,
        progress: progressPercentage,
      });
    });

    const groupedUsers = groupByNote(enrollments);

    const notedata = Object.entries(groupedUsers).map(([noteTitle, total]) => ({
      name: noteTitle,
      total: total,
    }));

    const notetotalEnrollments = enrollments.length;
    const notetotalStudents = uniqueStudentIds.size;

    return {
      notedata,
      notetotalEnrollments,
      notetotalStudents,
      noteuserNames,
      enrolledNotesCount,
      userNotes,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      data: [],
      totalEnrollments: 0,
      totalStudents: 0,
      userNames: {},
      enrolledNotesCount: {},
      userNotes: {},
    };
  }
};
