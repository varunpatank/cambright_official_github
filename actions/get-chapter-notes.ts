// v.0.0.01 salah
import { db } from "@/lib/db";
import { Attachment, NoteAttachment, NoteChapter } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  noteId: string;
  notechapterId: string;
}
export const getChapter = async ({
  userId,
  noteId,
  notechapterId,
}: GetChapterProps) => {
  try {
    const enrollment = await db.added.findUnique({
      where: {
        userId_noteId: {
          userId,
          noteId,
        },
      },
    });
    const note = await db.note.findUnique({
      where: {
        isPublished: true,
        id: noteId,
      },
    });
    const chapter = await db.noteChapter.findUnique({
      where: {
        id: notechapterId,
        isPublished: true,
      },
    });

    if (!chapter || !note) {
      throw new Error("not found...");
    }

    let cloudinaryData = null;
    let attachments: NoteAttachment[] = [];
    let nextChapter: NoteChapter | null = null;

    if (enrollment) {
      attachments = await db.noteAttachment.findMany({
        where: {
          noteId: noteId,
        },
      });
    }
    if (enrollment) {
      cloudinaryData = await db.noteCloudinaryData.findUnique({
        where: {
          notechapterId: notechapterId,
        },
      });
      nextChapter = await db.noteChapter.findFirst({
        where: {
          noteId: noteId,
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
    const userProgress = await db.noteUserProgress.findUnique({
      where: {
        userId,
        notechapterId,
      },
    });
    const vidUrl = chapter.videoUrl;
    return {
      chapter,
      note,
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
      note: null,
      attachments: [],
      cloudinaryData: null,
      nextChapter: null,
      videoUrl: null,
      userProgress: null,
      enrollment: null,
    };
  }
};
