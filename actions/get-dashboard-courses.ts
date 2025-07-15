// v.0.0.01 salah

import { db } from "@/lib/db";
import { Board, Chapter, Course, Subject } from "@prisma/client";
import { getProgress } from "./get-progress";

type CourseWithProgressWithSubject = Course & {
  subject: Subject | null;
  board: Board | null;
  chapters: { id: string; sessionlink: string }[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithSubject[];
  coursesInProgress: CourseWithProgressWithSubject[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const enrolledCourses = await db.enrollment.findMany({
      where: {
        userId: userId,
      },
      select: {
        course: {
          include: {
            subject: true,
            board: true,
            chapters: {
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

    const courses: CourseWithProgressWithSubject[] = enrolledCourses.map(
      (enrollment) => {
        const course = enrollment.course;
        return {
          ...course,
          subject: course.subject || null,
          board: course.board || null,
          chapters: course.chapters.map((chapter) => ({
            id: chapter.id,
            sessionlink: chapter.sessionlink || "",
          })),
          progress: null,
        };
      }
    );

    for (let course of courses) {
      const progress = await getProgress(userId, course.id);
      course.progress = progress;
    }

    const completedCourses = courses.filter(
      (course) => course.progress === 100
    );
    const coursesInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );
    return {
      completedCourses,
      coursesInProgress,
    };
  } catch {
    console.log("getdashboard error");
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
