// v.0.0.01 salah

import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, LayoutDashboard, Play, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterSessionLinkForm } from "./_components/chapter-session-link";
import { ChapterSessiontimeForm } from "./_components/chapter-sessiontime";
import { VideoForm } from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterActions } from "./_components/chapter-actions";
// export const maxDuration = 300;

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      cloudinaryData: true,
    },
  });

  if (!chapter) {
    return redirect("/dashboard");
  }

  const requiredFields = [
    chapter.title,
    chapter.description,
    chapter.videoUrl || chapter.sessionlink,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);
  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant={"warning"}
          label="This chapter is unpublished. It won't be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between ">
          <div className="w-full">
            <Link
              href={`/tutor/courses/${params.courseId}`}
              className="flex items-center text-md hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-slate-500">
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your chapter</h2>
            </div>
            <ChapterTitleForm
              initialData={chapter}
              chapterId={params.chapterId}
              courseId={params.courseId}
            />
            <ChapterDescriptionForm
              initialData={chapter}
              chapterId={params.chapterId}
              courseId={params.courseId}
            />
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Play} />
                <h2 className="text-xl">Meet Online</h2>
                <span className="text-md text-slate-500">(option 1)</span>
              </div>
              <div>
                <ChapterSessionLinkForm
                  initialData={chapter}
                  chapterId={params.chapterId}
                  courseId={params.courseId}
                />{" "}
                <ChapterSessiontimeForm
                  initialData={{
                    sessiondate:
                      chapter.sessiondate === null
                        ? undefined
                        : chapter.sessiondate,
                    sessiontime:
                      chapter.sessiontime === null
                        ? undefined
                        : chapter.sessiontime,
                  }}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
              <span className="text-md text-slate-500">(option 2)</span>
            </div>
            <div>
              <VideoForm
                initialData={chapter}
                chapterId={params.chapterId}
                courseId={params.courseId}
                chapterName={chapter.title}
              />
            </div>
          </div>

          <span className="text-sm text-slate-500">
            You need to add a video and/or schedule a meeting in order to
            publish
          </span>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
