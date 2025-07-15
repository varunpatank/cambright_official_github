// v.0.0.01 salah

import { Subject, Course, Board } from "@prisma/client";
import { getProgress } from "./get-progress";
import { db } from "@/lib/db";

type CourseWithProgressWithSubject = Course & {
  subject: Subject | null;
  board: Board | null;
  chapters: { id: string; sessionlink: string }[]; // sessionlink is non-nullable
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  subjectId?: string;
};

export const getCourses = async ({
  userId,
  title,
  subjectId,
}: GetCourses): Promise<CourseWithProgressWithSubject[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        subjectId,
      },
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
        enrollment: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coursesWithProgress: CourseWithProgressWithSubject[] =
      await Promise.all(
        courses.map(async (course) => {
          const progressPercent =
            course.enrollment.length === 0
              ? null
              : await getProgress(userId, course.id);

          const sanitizedChapters = course.chapters
            .filter((chapter) => chapter.sessionlink !== null)
            .map((chapter) => ({
              id: chapter.id,
              sessionlink: chapter.sessionlink as string,
            }));

          return {
            ...course,
            chapters: sanitizedChapters,
            progress: progressPercent,
          };
        })
      );

    return coursesWithProgress;
  } catch (error) {
    console.log("cant get courses", error);
    return [];
  }
};
