// v.0.0.01 salah

import { getChapter } from "@/actions/get-chapter-notes";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Videoplayer } from "../../_components/video-player";
import { getUserFirstName } from "@/lib/clerkername";
import { getUserIMGURL } from "@/lib/clerkerimage";
import { BadgeCheck, File } from "lucide-react";
import Link from "next/link";
import { NoteEnrollButton } from "../../_components/note-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { NoteProgressButton } from "../../_components/note-progress-button";
import { NoteNonEnrollButton } from "../../_components/note-nonenroll-button";

const fallbackImageURL = "https://cdn-icons-png.freepik.com/512/194/194935.png";

const ChapterIdPage = async ({
  params,
}: {
  params: { noteId: string; chapterId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const {
    chapter,
    note,
    attachments,
    cloudinaryData,
    userProgress,
    nextChapter,
    vidUrl,
    enrollment,
  } = await getChapter({
    userId,
    notechapterId: params.chapterId,
    noteId: params.noteId,
  });

  if (!chapter || !note) {
    return redirect("/");
  }

  const noteOwnerName = await getUserFirstName(note.userId);
  const noteOwnerIMGURL = await getUserIMGURL(note.userId);

  const isLocked = !chapter.title.toLowerCase().includes("intr") && !enrollment;
  const completeOnEnd = !!enrollment && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner
          label="You already completed this chapter."
          variant={"success"}
        />
      )}
      {isLocked && (
        <Banner
          label="Please enroll for free to unlock full note."
          variant={"warning"}
        />
      )}
      <div className="flex-col flex max-w-4xl mx-auto pb-20 min-h-screen">
        <div className="p-4">
          <div>
            <div className="p-4 flex flex-col md:flex-row items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold mb-2"> {chapter.title}</h2>
              {enrollment ? (
                <NoteProgressButton
                  chapterId={params.chapterId}
                  noteId={params.noteId}
                  nextChapterId={nextChapter?.id}
                  isCompleted={!!userProgress?.isCompleted}
                />
              ) : (
                <NoteEnrollButton noteId={params.noteId} />
              )}
            </div>
            <Separator />
            <div>
              <Preview value={chapter.description!} />
            </div>
            {!!attachments.length && (
              <>
                <Separator />
                <div className="p-4">
                  {attachments.map((attachment) => (
                    <a
                      href={attachment.url}
                      target="_blank"
                      key={attachment.id}
                      className="flex items-center p-3 w-full border-[rgb(30, 41, 59)] border text-slate-400 rounded-md hover:underline"
                    >
                      <File className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p className="line-clamp-1">{attachment.name}</p>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <Videoplayer
            chapterId={params.chapterId}
            title={chapter.title}
            noteId={params.noteId}
            nextChapterId={nextChapter?.id}
            playbackId={cloudinaryData?.playbackId!}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
            videoUrl={vidUrl}
            sessiondate={chapter.sessiondate}
            sessiontime={chapter.sessiontime}
            sessionlink={chapter.sessionlink}
          />
        </div>
      </div>
      <footer className="bg-gray-800 text-gray-400 text-center py-3 text-sm flex justify-between items-center px-4">
        <Link href={"/"} className="flex items-center z-10">
          <button className="flex items-center text-slate-400 hover:text-slate-500 transition rounded-full px-2 py-1">
            <span className="text-sm font-medium mr-2">Note by:</span>
            <img
              className="rounded-full w-5 h-5 object-cover mr-1"
              src={noteOwnerIMGURL || fallbackImageURL}
              alt={noteOwnerName || "note Owner"}
            />
            <span className="text-xs font-medium">
              {noteOwnerName || "Tutor"}
            </span>
            <BadgeCheck className="w-4 h-4 ml-1" />
          </button>
        </Link>
        {enrollment && <NoteNonEnrollButton noteId={note.id} />}
      </footer>
    </div>
  );
};
export default ChapterIdPage;
