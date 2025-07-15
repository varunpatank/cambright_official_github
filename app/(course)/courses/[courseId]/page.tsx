// v.0.0.01 salah

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
// export const maxDuration = 300;

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/search");
  }

  if (course.chapters.length > 0) {
    return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
  } else {
    return null;
  }
};

export default CourseIdPage;
