// v.0.0.01 salah

import { db } from "@/lib/db";
export const getProgress = async (
  userId: string,
  noteId: string
): Promise<number> => {
  try {
    const publishedChapters = await db.noteChapter.findMany({
      where: {
        noteId: noteId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);
    const validCompletedChapters = await db.noteUserProgress.count({
      where: {
        userId: userId,
        notechapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      },
    });
    const progressPercent =
      (validCompletedChapters / publishedChapterIds.length) * 100;
    return progressPercent;
  } catch (error) {
    console.log("progress error");
    return 0;
  }
};
