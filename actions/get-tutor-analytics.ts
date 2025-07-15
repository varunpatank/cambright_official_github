// v.0.0.01 salah

import { db } from "@/lib/db";
import { Added, Course, Enrollment, Note, UserProgress } from "@prisma/client";
import { getUsersFirstNames } from "@/lib/clerkername";

type UserDetails = {
  fullname: string | null;
  username: string | null;
  imageUrl: string | null;
  email: string | null;
  lastActiveAt: Date | null;
};

type EnrollmentWithCourse = Enrollment & {
  course: Course;
};

const groupByCourse = (enrollments: EnrollmentWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  enrollments.forEach((enrollment) => {
    const courseTitle = enrollment.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += 1;
  });
  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    const enrollments = await db.enrollment.findMany({
      where: {
        course: { userId: userId },
      },
      include: {
        course: {
          include: {
            chapters: true,
          },
        },
      },
    });

    const uniqueStudentIds: Set<string> = new Set();
    enrollments.forEach((enrollment) => {
      uniqueStudentIds.add(enrollment.userId);
    });

    const studentIds = Array.from(uniqueStudentIds);
    const userNames = await getUsersFirstNames(studentIds);

    const progressData = await db.userProgress.findMany({
      where: { userId: { in: studentIds } },
      include: { chapter: { include: { course: true } } },
    });

    const enrolledCoursesCount: Record<string, number> = {};
    const userCourses: Record<string, { title: string; progress: number }[]> =
      {};

    enrollments.forEach((enrollment) => {
      const { userId, course } = enrollment;
      if (!enrolledCoursesCount[userId]) {
        enrolledCoursesCount[userId] = 0;
        userCourses[userId] = [];
      }
      enrolledCoursesCount[userId] += 1;

      const courseChapters = course.chapters.length;
      const completedChapters = progressData.filter(
        (p) =>
          p.chapter.courseId === course.id &&
          p.userId === userId &&
          p.isCompleted
      ).length;

      const progressPercentage =
        courseChapters > 0 ? (completedChapters / courseChapters) * 100 : 0;

      userCourses[userId].push({
        title: course.title,
        progress: progressPercentage,
      });
    });

    const groupedUsers = groupByCourse(enrollments);

    const data = Object.entries(groupedUsers).map(([courseTitle, total]) => ({
      name: courseTitle,
      total: total,
    }));

    const totalEnrollments = enrollments.length;
    const totalStudents = uniqueStudentIds.size;

    return {
      data,
      totalEnrollments,
      totalStudents,
      userNames,
      enrolledCoursesCount,
      userCourses,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      data: [],
      totalEnrollments: 0,
      totalStudents: 0,
      userNames: {},
      enrolledCoursesCount: {},
      userCourses: {},
    };
  }
};
