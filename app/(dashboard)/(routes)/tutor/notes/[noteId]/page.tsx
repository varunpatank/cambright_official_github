// v.0.0.01 salah

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  File,
  LayoutDashboard,
  ListChecks,
  ListVideo,
  Play,
} from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { SubjectForm } from "./_components/subject-form";
import { SessionlinkForm } from "./_components/sessionlink-form";
import { SessiontimeForm } from "./_components/sessiontime";
import { AttachmentForm } from "./_components/attachment-form";
import { AttachmentlinkForm } from "./_components/attachmentlink-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import Link from "next/link";
import { BoardForm } from "./_components/board-form";

const CourseIdPage = async ({ params }: { params: { noteId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  // Fetch course with chapters
  const note = await db.note.findUnique({
    where: {
      id: params.noteId,
      userId,
    },
    include: {
      notechapters: { orderBy: { position: "asc" } },
      noteattachments: { orderBy: { createdAt: "desc" } },
    },
  });

  // Fetch subjects and boards
  const subjects = await db.noteSubject.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const boards = await db.noteBoard.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!note) {
    return redirect("/tutor/notes");
  }
  const notepublishedChapters = note.notechapters.filter(
    (notechapter) => notechapter.isPublished
  );

  const requiredFields = [
    note.title,
    note.description,
    note.imageUrl,
    note.notesubjectId,
    note.noteboardId,
  ];

  const allRequiredFieldsFilled = requiredFields.every(
    (field) => Boolean(field) && notepublishedChapters.length > 0
  );

  const optionalFieldsFilled =
    note.sessionlink !== null ||
    note.sessiondate !== null ||
    note.sessiontime !== null ||
    notepublishedChapters.length > 0;

  const isComplete = optionalFieldsFilled && allRequiredFieldsFilled;

  const totalFields = requiredFields.length + 1;

  const completedFields =
    requiredFields.filter(Boolean).length +
    (notepublishedChapters.length > 0 ? 1 : 0);

  const completionText = `(${completedFields} / ${totalFields})`;

  return (
    <>
      {!note.isPublished && (
        <Banner
          variant={"warning"}
          label="This notes are unpublished. It won't be visible to anyone"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between ">
          <div className="w-full">
            <Link
              href={`/tutor/notes`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to notes
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex-col flex gap-y-2">
                <h1 className="text-2xl font-medium">Notes Setup</h1>
                <span className="text-sm text-slate-500">
                  Complete all fields {completionText}
                </span>
              </div>
              <Actions
                disabled={!isComplete}
                noteId={params.noteId}
                isPublished={note.isPublished}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={LayoutDashboard} />
                  <h2 className="text-xl">Customize your notes</h2>
                </div>
                <TitleForm initialData={note} noteId={note.id} />
                <DescriptionForm initialData={note} noteId={note.id} />
                <ImageForm initialData={note} noteId={note.id} />
                <SubjectForm
                  initialData={note}
                  noteId={note.id}
                  options={subjects.map((subject) => ({
                    label: subject.name,
                    value: subject.id,
                  }))}
                />
                <BoardForm
                  initialData={note}
                  noteId={note.id}
                  options={boards.map((board) => ({
                    label: board.name,
                    value: board.id,
                  }))}
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Play} />
                  <h2 className="text-xl">Online Sessions</h2>
                  <span className="text-sm text-slate-500">(optional)</span>
                </div>
                <div>
                  <SessionlinkForm initialData={note} noteId={note.id} />
                  <SessiontimeForm
                    initialData={{
                      sessiondate:
                        note.sessiondate === null
                          ? undefined
                          : note.sessiondate,
                      sessiontime:
                        note.sessiontime === null
                          ? undefined
                          : note.sessiontime,
                    }}
                    noteId={note.id}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-x-2">
                    <IconBadge icon={File} />
                    <h2 className="text-xl">Resources</h2>
                    <span className="text-sm text-slate-500">(optional)</span>
                  </div>
                  <div>
                    <AttachmentForm initialData={note} noteId={note.id} />
                    <AttachmentlinkForm initialData={note} noteId={note.id} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-x-2">
                    <IconBadge icon={ListVideo} />
                    <h2 className="text-xl">
                      Chapters{" "}
                      <p className="text-sm text-slate-500">
                        Here you can divide subject into chapters
                      </p>
                    </h2>
                  </div>
                  <div>
                    <ChaptersForm initialData={note} noteId={note.id} />
                  </div>
                  <span className="text-sm text-slate-500">
                    You need to add atleast one published chapter to publish
                    notes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
