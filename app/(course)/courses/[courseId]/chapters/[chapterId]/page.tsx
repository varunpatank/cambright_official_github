// v.0.0.01 salah

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Videoplayer } from "../../_components/video-player";
import { getUserFirstName } from "@/lib/clerkername";
import { getUserIMGURL } from "@/lib/clerkerimage";
import { getDatabaseUsername, getDatabaseUserData } from "@/lib/get-database-username";
import { BadgeCheck, File } from "lucide-react";
import Link from "next/link";
import { CourseEnrollButton } from "../../_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { PDFPreview } from "@/components/pdf-preview";
import { CourseProgressButton } from "../../_components/course-progress-button";
import { CourseNonEnrollButton } from "../../_components/course-nonenroll-button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { StarryBackground } from "@/components/ui/starry-background";

const fallbackImageURL = "https://cdn-icons-png.freepik.com/512/194/194935.png";
const getLinkText = (url: string) => {
  // If the URL starts with "https://", remove that part for display
  return url.split("https://")[1];
};

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }
  const {
    chapter,
    course,
    attachments,
    cloudinaryData,
    userProgress,
    nextChapter,
    vidUrl,
    enrollment,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/dashboard");
  }

  // Try to get display data from Clerk first
  const clerkOwnerName = await getUserFirstName(course.userId);
  const clerkOwnerIMGURL = await getUserIMGURL(course.userId);
  const databaseUsername = await getDatabaseUsername(course.userId);
  
  // Get database data as fallback
  const databaseOwnerData = await getDatabaseUserData(course.userId);
  
  // Use Clerk data if available, otherwise fall back to database data
  const courseOwnerName = clerkOwnerName || databaseOwnerData.name;
  const courseOwnerIMGURL = clerkOwnerIMGURL || databaseOwnerData.imageUrl;

  const isLocked = !chapter.title.toLowerCase().includes("intr") && !enrollment;
  const completeOnEnd = !!enrollment && !userProgress?.isCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 relative overflow-hidden">
      {/* Enhanced Starry Background with Meteors */}
      <StarryBackground 
        className="absolute inset-0" 
        height="100vh"
        showMeteors={true}
        intensity="medium"
      />
      
      {/* Banner Notifications */}
      {userProgress?.isCompleted && (
        <div className="relative z-20">
          <Banner
            label="You already completed this chapter."
            variant={"success"}
          />
        </div>
      )}
      {isLocked && (
        <div className="relative z-20">
          <Banner
            label="Please enroll for free to unlock full course."
            variant={"warning"}
          />
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Course Header - Only for intro chapters */}
        {(chapter?.title.toLowerCase().includes("intro") || chapter?.position === 0) && (
          <div className="bg-gradient-to-r from-purple-900/20 to-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 lg:h-32 lg:w-32 rounded-2xl shadow-2xl ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300">
                  <AvatarImage src={course.imageUrl || ""} className="object-cover" />
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full p-2 shadow-lg">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
                    {course.title}
                  </h1>
                  <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                    {course.description}
                  </p>
                </div>

                {course.attachmentLink && (
                  <div className="pt-4 border-t border-purple-500/20">
                    <div className="text-sm text-slate-400 space-y-2">
                      {course.attachmentLink
                        .split(/(https:\/\/[^\s]+)/g)
                        .map((part, index) =>
                          part.match(/^https:\/\//) ? (
                            <a
                              key={index}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20"
                            >
                              <span className="text-xs">🔗</span>
                              {part.replace("https://", "")}
                            </a>
                          ) : (
                            <span key={index} className="text-slate-400">{part}</span>
                          )
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Course By Section - Moved to Top */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl">
            <div className="flex items-center space-x-4">
              {databaseUsername ? (
                <Link href={`/profiles/${databaseUsername}`}>
                  <button className="flex items-center text-slate-300 hover:text-white transition-all rounded-full px-6 py-3 hover:bg-purple-500/20 group">
                    <img
                      className="rounded-full w-12 h-12 object-cover mr-4 ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all"
                      src={courseOwnerIMGURL || fallbackImageURL}
                      alt={courseOwnerName || "Course Owner"}
                    />
                    <div className="text-left">
                      <span className="text-sm font-medium block text-slate-400">Course by</span>
                      <span className="text-lg font-semibold text-white">
                        {courseOwnerName || "Tutor"}
                      </span>
                    </div>
                    <BadgeCheck className="w-5 h-5 ml-3 text-purple-400" />
                  </button>
                </Link>
              ) : (
                <button className="flex items-center text-slate-300 rounded-full px-6 py-3 cursor-default">
                  <img
                    className="rounded-full w-12 h-12 object-cover mr-4 ring-2 ring-purple-500/30"
                    src={courseOwnerIMGURL || fallbackImageURL}
                    alt={courseOwnerName || "Course Owner"}
                  />
                  <div className="text-left">
                    <span className="text-sm font-medium block text-slate-400">Course by</span>
                    <span className="text-lg font-semibold text-white">
                      {courseOwnerName || "Tutor"}
                    </span>
                  </div>
                  <BadgeCheck className="w-5 h-5 ml-3 text-purple-400" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Chapter Content */}
        <div className="space-y-8">
          {/* Chapter Header */}
          <div className="bg-gradient-to-r from-slate-800/40 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/10 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{chapter.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                    Chapter {chapter.position + 1}
                  </span>
                  <span>•</span>
                  <span>{course.title}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {enrollment ? (
                  <CourseProgressButton
                    chapterId={params.chapterId}
                    courseId={params.courseId}
                    nextChapterId={nextChapter?.id}
                    isCompleted={!!userProgress?.isCompleted}
                  />
                ) : (
                  <CourseEnrollButton courseId={params.courseId} />
                )}
              </div>
            </div>
          </div>

          {/* Course Materials — student-uploaded, shown above the generated chapter notes */}
          {!!attachments.length && (
            <div className="bg-gradient-to-br from-slate-800/30 to-purple-900/10 backdrop-blur-xl rounded-2xl border border-purple-500/10 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-purple-500/10">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Course Materials
                  <span className="text-sm text-slate-400 font-normal">({attachments.length} files)</span>
                </h3>
              </div>
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                  {attachments.map((attachment) => {
                    const isPDF = attachment.name.toLowerCase().endsWith('.pdf');
                    const fileExtension = attachment.name.split('.').pop()?.toUpperCase() || 'FILE';

                    return isPDF ? (
                      <PDFPreview
                        key={attachment.id}
                        url={attachment.url}
                        name={attachment.name}
                        courseId={params.courseId}
                        attachmentId={attachment.id}
                      />
                    ) : (
                      <a
                        href={`/api/courses/${params.courseId}/attachments/${attachment.id}`}
                        target="_blank"
                        key={attachment.id}
                        className="group flex items-center p-6 border border-purple-500/20 rounded-xl bg-gradient-to-br from-slate-800/40 to-purple-900/20 hover:from-purple-800/30 hover:to-purple-700/20 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] text-slate-200 hover:text-white"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                          <File className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg truncate">{attachment.name}</p>
                          <p className="text-sm text-slate-400 group-hover:text-purple-300">Click to download • {fileExtension} file</p>
                        </div>
                        <span className="text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-2 rounded-md border border-purple-500/30 ml-4">
                          {fileExtension}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chapter Notes - Compact and Beautiful */}
          <div className="bg-gradient-to-br from-slate-800/30 to-purple-900/10 backdrop-blur-xl rounded-2xl border border-purple-500/10 shadow-lg">
            <div className="p-6 border-b border-purple-500/10">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Chapter Notes
              </h3>
            </div>
            <div className="p-6">
              <div className="prose prose-slate prose-4xl max-w-none">
                <Preview value={chapter.description || "No notes available for this chapter."} classs="!bg-transparent !text-slate-200 !text-3xl leading-relaxed" />
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl rounded-3xl border border-purple-500/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-purple-500/10">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m2 0h1.586a1 1 0 01.707.293l.707.707A1 1 0 0020.414 12H21M21 12v2a2 2 0 01-2 2h-1M3 7v10a2 2 0 002 2h1" />
                  </svg>
                </div>
                Video Lesson
              </h3>
            </div>
            <div className="p-6">
              <Videoplayer
                chapterId={params.chapterId}
                title={chapter.title}
                courseId={params.courseId}
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
        </div>
      </div>
      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-slate-900/80 to-purple-900/20 backdrop-blur-xl border-t border-purple-500/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-slate-400 text-sm">
                © 2024 Cambright. All rights reserved.
              </p>
            </div>
            {enrollment && <CourseNonEnrollButton courseId={course.id} />}
          </div>
        </div>
      </footer>
    </div>
  );
};
export default ChapterIdPage;
