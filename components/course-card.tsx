'use client'
import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "./icon-badge";
import { BadgeCheck, BookOpen, Play, Pencil } from "lucide-react";
import { CourseProgress } from "./course-progress";
import { useRouter } from 'next/navigation'

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  progress: number | null;
  subject: string;
  board: string;
  isOnline: boolean;
  courseOwner: string;
  isSuperAdmin?: boolean;
  clerkName?: string | null;
  clerkImageURL?: string | null;
  databaseUsername?: string | null;
  databaseUserData?: { name: string | null; imageUrl: string | null };
}

const fallbackImageURL = "https://cdn-icons-png.freepik.com/512/194/194935.png";

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  progress,
  subject,
  board,
  isOnline,
  courseOwner,
  isSuperAdmin = false,
  clerkName,
  clerkImageURL,
  databaseUsername,
  databaseUserData,
}: CourseCardProps) => {
  const router = useRouter()
  // Use Clerk data if available, otherwise fall back to database data
  const courseOwnerName = clerkName || databaseUserData?.name;
  const courseOwnerIMGURL = clerkImageURL || databaseUserData?.imageUrl;

  return (
    <div className="relative group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full bg-slate-950">
      {isSuperAdmin && (
        <button
          className="absolute top-2 right-2 z-20 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1 shadow"
          title="Edit Course"
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            router.push(`/courses/${id}/edit`)
          }}
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      <Link href={`/courses/${id}`} className="block">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image fill className="object-cover" alt={title} src={imageUrl} />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-xl md:text-base font-medium group-hover:text-purple-500 transition line-clamp-2">
            {title}
          </div>
          <div className="inline-flex gap-x-2">
            <button className="flex items-center bg-purple-800 transition text-slate-100 rounded-full px-2 py-1  mt-1 justify-center contentfitter">
              <span className="text-xs font-medium">{subject || "Other"}</span>
            </button>
            <button className="flex items-center bg-slate-700 transition text-slate-100 rounded-full px-2 py-1  mt-1 justify-center contentfitter">
              <span className="text-xs font-medium">{board || "IGCSE"}</span>
            </button>
          </div>
          <div className="my-3 items-center block gap-x-2 text-sm md:text-xs sm:flex">
            <div className="flex  items-center gap-x-1 text-slate-500  mb-[0.35rem] sm:mb-0">
              {chaptersLength > 0 && (
                <>
                  <IconBadge size={"sm"} icon={BookOpen} />
                  <span>
                    {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
                  </span>
                </>
              )}{" "}
            </div>
            <div className="flex items-center gap-x-1 text-slate-500 ">
              {isOnline && (
                <>
                  <IconBadge size={"sm"} icon={Play} variant={"online"} />
                  <span className="text-slate-400/70 ">{"Online Lessons"}</span>
                </>
              )}
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              size="sm"
              value={progress}
              variant={progress === 100 ? "success" : "default"}
            />
          ) : (
            <div className="z-10">
              {databaseUsername ? (
                <Link href={`/profiles/${databaseUsername}`}>
                  <button className="flex items-center text-slate-400 hover:text-slate-500 transition  rounded-full px-2 py-1  mt-2 justify-start contentfitter">
                    <span className="text-sm font-medium mr-2">by:</span>
                    <div className="relative w-5 h-5 mr-1">
                      <Image
                        fill
                        className="rounded-full object-cover"
                        src={courseOwnerIMGURL || fallbackImageURL}
                        alt={courseOwnerName || "Course Owner"}
                        sizes="20px"
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {courseOwnerName || "Tutor"}
                    </span>
                    <BadgeCheck className="w-4 h-4 ml-1" />
                  </button>
                </Link>
              ) : (
                <button className="flex items-center text-slate-400 rounded-full px-2 py-1 mt-2 justify-start contentfitter cursor-default">
                  <span className="text-sm font-medium mr-2">by:</span>
                  <div className="relative w-5 h-5 mr-1">
                    <Image
                      fill
                      className="rounded-full object-cover"
                      src={fallbackImageURL}
                      alt="Course Owner"
                      sizes="20px"
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {courseOwnerName || "Tutor"}
                  </span>
                  <BadgeCheck className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
