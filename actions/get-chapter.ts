// v.0.0.01 salah
import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}
export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
      },
    });
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    if (!chapter || !course) {
      throw new Error("not found...");
    }

    let cloudinaryData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (enrollment) {
      attachments = await db.attachment.findMany({
        where: {
          courseId: courseId,
        },
      });
    }
    if (enrollment) {
      cloudinaryData = await db.cloudinaryData.findUnique({
        where: {
          chapterId: chapterId,
        },
      });
      nextChapter = await db.chapter.findFirst({
        where: {
          courseId: courseId,
          isPublished: true,
          position: {
            gt: chapter?.position,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }
    const userProgress = await db.userProgress.findUnique({
      where: {
        userId,
        chapterId,
      },
    });
    const vidUrl = chapter.videoUrl;
    return {
      chapter,
      course,
      cloudinaryData,
      attachments,
      nextChapter,
      userProgress,
      enrollment,
      vidUrl,
    };
  } catch {
    console.log("cant get chapter props");
    return {
      chapter: null,
      course: null,
      attachments: [],
      cloudinaryData: null,
      nextChapter: null,
      videoUrl: null,
      userProgress: null,
      enrollment: null,
    };
  }
};
