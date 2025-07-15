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
// export const maxDuration = 300;

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  // Fetch course with chapters
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: { orderBy: { position: "asc" } },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  // Fetch subjects and boards
  const subjects = await db.subject.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const boards = await db.board.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!course) {
    return redirect("/tutor/courses");
  }
  const publishedChapters = course.chapters.filter(
    (chapter) => chapter.isPublished
  );

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.subjectId,
    course.boardId,
  ];

  const allRequiredFieldsFilled = requiredFields.every(
    (field) => Boolean(field) && publishedChapters.length > 0
  );

  const optionalFieldsFilled =
    course.sessionlink !== null ||
    course.sessiondate !== null ||
    course.sessiontime !== null ||
    publishedChapters.length > 0;

  const isComplete = optionalFieldsFilled && allRequiredFieldsFilled;

  const totalFields = requiredFields.length + 1;

  const completedFields =
    requiredFields.filter(Boolean).length +
    (publishedChapters.length > 0 ? 1 : 0);

  const completionText = `(${completedFields} / ${totalFields})`;

  return (
    <>
      {!course.isPublished && (
        <Banner
          variant={"warning"}
          label="This course is unpublished. It won't be visible to anyone"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between ">
          <div className="w-full">
            <Link
              href={`/tutor/courses`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex-col flex gap-y-2">
                <h1 className="text-2xl font-medium">Course Setup</h1>
                <span className="text-sm text-slate-500">
                  Complete all fields {completionText}
                </span>
              </div>
              <Actions
                disabled={!isComplete}
                courseId={params.courseId}
                isPublished={course.isPublished}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={LayoutDashboard} />
                  <h2 className="text-xl">Customize your course</h2>
                </div>
                <TitleForm initialData={course} courseId={course.id} />
                <DescriptionForm initialData={course} courseId={course.id} />
                <ImageForm initialData={course} courseId={course.id} />
                <SubjectForm
                  initialData={course}
                  courseId={course.id}
                  options={subjects.map((subject) => ({
                    label: subject.name,
                    value: subject.id,
                  }))}
                />
                <BoardForm
                  initialData={course}
                  courseId={course.id}
                  options={boards.map((board) => ({
                    label: board.name,
                    value: board.id,
                  }))}
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Play} />
                  <h2 className="text-xl">Intro Meeting</h2>
                  <span className="text-sm text-slate-500">(optional)</span>
                </div>
                <div>
                  <SessionlinkForm initialData={course} courseId={course.id} />
                  <SessiontimeForm
                    initialData={{
                      sessiondate:
                        course.sessiondate === null
                          ? undefined
                          : course.sessiondate,
                      sessiontime:
                        course.sessiontime === null
                          ? undefined
                          : course.sessiontime,
                    }}
                    courseId={course.id}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-x-2">
                    <IconBadge icon={File} />
                    <h2 className="text-xl">Resources</h2>
                    <span className="text-sm text-slate-500">(optional)</span>
                  </div>
                  <div>
                    <AttachmentForm initialData={course} courseId={course.id} />
                    <AttachmentlinkForm
                      initialData={course}
                      courseId={course.id}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-x-2">
                    <IconBadge icon={ListVideo} />
                    <h2 className="text-xl">
                      Course Chapters{" "}
                      <p className="text-sm text-slate-500">
                        You can also add all your meetings as chapters
                      </p>
                    </h2>
                  </div>
                  <div>
                    <ChaptersForm initialData={course} courseId={course.id} />
                  </div>
                  <span className="text-sm text-slate-500">
                    You need to add atleast one published chapter to publish
                    course.
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
