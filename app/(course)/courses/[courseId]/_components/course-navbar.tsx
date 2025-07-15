// v.0.0.01 salah

import NavbarRoutes from "@/components/navbar-routes";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { CourseMobileSidebar } from "./course-mobile-sidebar";

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center border-n-6 bg-n-8/90 backdrop-blur-sm shadow-sm">
      {course.chapters.length > 0 && (
        <CourseMobileSidebar course={course} progressCount={progressCount} />
      )}
      <NavbarRoutes />
    </div>
  );
};
