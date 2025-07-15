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
import { CourseProgressButton } from "../../_components/course-progress-button";
import { CourseNonEnrollButton } from "../../_components/course-nonenroll-button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
// export const maxDuration = 300;

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
    <div>
      {userProgress?.isCompleted && (
        <Banner
          label="You already completed this chapter."
          variant={"success"}
        />
      )}
      {isLocked && (
        <Banner
          label="Please enroll for free to unlock full course."
          variant={"warning"}
        />
      )}
      <div className="flex-col flex max-w-4xl mx-auto pb-20 min-h-screen">
        <div className="p-4">
          {" "}
          {(chapter?.title.toLowerCase().includes("intro") ||
            chapter?.position === 0) && (
            <div className="bg-n-7 p-6 rounded-lg shadow-lg mb-6 mx-auto max-w-full h-auto">
              <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16 mb-4 sm:mb-0 sm:mr-4 rounded-full hover:ring-2 hover:ring-purple-500 transition-all">
                  <AvatarImage src={course.imageUrl || ""} />
                </Avatar>

                {/* Content */}
                <div className="w-full sm:w-auto max-w-full h-auto">
                  <h1 className="text-lg font-semibold">{course.title}</h1>
                  <p className="text-gray-300 mt-1 text-sm whitespace-normal">
                    {course.description}
                  </p>

                  <Separator className="mt-2 mb-2" />

                  {
                    // Check if `course.attachmentLink` exists and is a string
                    course.attachmentLink &&
                      // Split the string into parts: non-link text and links
                      course.attachmentLink
                        .split(/(https:\/\/[^\s]+)/g)
                        .map((part, index) =>
                          // Check if the part is a link (matches the regex for https:// URLs)
                          part.match(/^https:\/\//) ? (
                            // Render the link as a clickable <Link> or <a> component
                            <>
                              <br />
                              <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:underline"
                              >
                                {part.replace("https://", "")}{" "}
                                {/* Display the link without 'https://' */}
                              </a>
                              <br />
                            </>
                          ) : (
                            // Render the non-link part as plain text (inside a <span>)
                            <span key={index}>{part}</span>
                          )
                        )
                  }
                </div>
              </div>
            </div>
          )}
          <div>
            {" "}
            <div className="p-4 flex flex-col md:flex-row items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold mb-2"> {chapter.title}</h2>
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
      <footer className="bg-gray-800 text-gray-400 text-center py-3 text-sm flex justify-between items-center px-4">
        <div className="flex items-center z-10">
          {databaseUsername ? (
            <Link href={`/profiles/${databaseUsername}`}>
              <button className="flex items-center text-slate-400 hover:text-slate-500 transition rounded-full px-2 py-1">
                <span className="text-sm font-medium mr-2">Course by:</span>
                <img
                  className="rounded-full w-5 h-5 object-cover mr-1"
                  src={courseOwnerIMGURL || fallbackImageURL}
                  alt={courseOwnerName || "Course Owner"}
                />
                <span className="text-xs font-medium">
                  {courseOwnerName || "Tutor"}
                </span>
                <BadgeCheck className="w-4 h-4 ml-1" />
              </button>
            </Link>
          ) : (
            <button className="flex items-center text-slate-400 rounded-full px-2 py-1 cursor-default">
              <span className="text-sm font-medium mr-2">Course by:</span>
              <img
                className="rounded-full w-5 h-5 object-cover mr-1"
                src={courseOwnerIMGURL || fallbackImageURL}
                alt={courseOwnerName || "Course Owner"}
              />
              <span className="text-xs font-medium">
                {courseOwnerName || "Tutor"}
              </span>
              <BadgeCheck className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        {enrollment && <CourseNonEnrollButton courseId={course.id} />}
      </footer>
    </div>
  );
};
export default ChapterIdPage;
