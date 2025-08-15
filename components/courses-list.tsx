import { Board, Course, Subject } from "@prisma/client";
import Image from "next/image";
import { FaFaceGrinBeamSweat } from "react-icons/fa6";
import { CourseCard } from "./course-card";
import { getUserFirstName } from '@/lib/clerkername'
import { getUserIMGURL } from '@/lib/clerkerimage'
import { getDatabaseUsername, getDatabaseUserData } from '@/lib/get-database-username'
import { auth } from '@clerk/nextjs/server'
import { useAdminStatus } from '@/hooks/use-admin-status'

type CourseWithProgressWithSubject = Course & {
  subject: Subject | null;
  board: Board | null;
  chapters: { id: string; sessionlink: string }[];
  progress: number | null;
};

interface CoursesListProps {
  prevImage?: boolean;
  items: CourseWithProgressWithSubject[];
}

export const CoursesList = async ({ items, prevImage = true }: CoursesListProps) => {
  const { userId } = auth();
  // Use a server-side check for super admin
  const isSuperAdmin = process.env.NODE_ENV === 'development' ? true : (userId && process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS?.split(',').includes(userId));

  // Fetch all user info in parallel
  const userInfo = await Promise.all(items.map(async (item) => {
    const [clerkName, clerkImageURL, databaseUsername, databaseUserData] = await Promise.all([
      getUserFirstName(item.userId),
      getUserIMGURL(item.userId),
      getDatabaseUsername(item.userId),
      getDatabaseUserData(item.userId),
    ])
    return {
      id: item.id,
      clerkName,
      clerkImageURL,
      databaseUsername,
      databaseUserData,
    }
  }))
  const userInfoMap = Object.fromEntries(userInfo.map(u => [u.id, u]))

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const info = userInfoMap[item.id]
          return (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl || ""}
              imageAssetId={item.imageAssetId}
              chaptersLength={item.chapters.length}
              progress={item.progress}
              subject={item.subject?.name!}
              board={item.board?.name!}
              isOnline={Boolean(item?.chapters.map((chapter) => chapter?.sessionlink))}
              courseOwner={item.userId}
              isSuperAdmin={!!isSuperAdmin}
              clerkName={info?.clerkName}
              clerkImageURL={info?.clerkImageURL}
              databaseUsername={info?.databaseUsername}
              databaseUserData={info?.databaseUserData}
            />
          )
        })}
      </div>
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-xl mt-8">
            <span>No Courses found</span>
            <FaFaceGrinBeamSweat className="text-lg" />
          </div>
          {prevImage === true && (
            <Image
              src="/nocourses.svg"
              height={600}
              width={600}
              alt="No courses found"
              className="mt-9"
            />
          )}
        </div>
      )}
    </div>
  )
}
