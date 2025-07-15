// v.0.0.01 salah

import { getAnalytics } from "@/actions/get-tutor-analytics";
import { getNoteAnalytics } from "@/actions/get-tutor-analytics-notes";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataCard } from "./_components/data-card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { Chart } from "./_components/chart";
import { DataTable } from "../courses/_components/data-table";
import { columns } from "../courses/_components/columns";
import { NoteDataTable } from "../notes/_components/data-table";
import { notecolumns } from "../notes/_components/columns";
import { NoteChart } from "./_components/note-chart";

interface UserDetails {
  fullname: string | null;
  username: string | null;
  email: string | null;
  imageUrl: string | null;
  lastActiveAt: Date | null;
}

const AnalyticsPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }

  const pcourses = await db.course.findMany({
    where: {
      userId,
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const pnotes = await db.note.findMany({
    where: {
      userId,
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const {
    data,
    totalEnrollments,
    totalStudents,
    userNames,
    enrolledCoursesCount,
    userCourses,
  } = await getAnalytics(userId);
  const {
    notedata,
    notetotalEnrollments,
    notetotalStudents,
    noteuserNames,
    enrolledNotesCount,
    userNotes,
  } = await getNoteAnalytics(userId);

  return (
    <div className="p-8 text-gray-100 min-h-screen space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        <DataCard value={totalEnrollments} label={"Total Enrolls"} />
        <DataCard value={pcourses.length} label={"Published Courses"} />
        <DataCard value={pnotes.length} label={"Published Notes"} />
      </div>
      <div className="mt-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-100">
          Students {`(${totalStudents})`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(userNames).map(([userId, userDetails]) => (
            <div
              key={userId}
              className="p-6 border rounded-lg border-gray-700 mb-6 flex flex-col items-center space-y-4"
            >
              <div className="flex flex-col items-center">
                {userDetails?.imageUrl && (
                  <img
                    src={userDetails.imageUrl}
                    alt="User Image"
                    className="w-24 h-24 rounded-full mb-4 border-2 border-purple-950 hover:w-28 hover:h-28 transition-all"
                  />
                )}
                <h3 className="text-xl font-semibold text-gray-100">
                  {userDetails?.fullname || "No Name"}
                </h3>
              </div>

              <p className="text-sm text-gray-300 text-center">
                Username: {userDetails?.username || "No Username"}
              </p>
              <p className="text-sm text-gray-300 text-center">
                Email:{" "}
                <a
                  href={`mailto:${userDetails?.email || ""}`}
                  className="text-blue-400 hover:underline"
                >
                  {userDetails?.email || "No Email"}
                </a>
              </p>
              <p className="text-sm text-gray-300 text-center">
                Last Active:{" "}
                {userDetails?.lastActiveAt
                  ? userDetails.lastActiveAt.toLocaleString()
                  : "Never"}
              </p>
              <p className="text-sm text-gray-300 text-center">
                Enrolled Courses: {enrolledCoursesCount[userId] || 0}
              </p>

              <div className="w-full mt-4">
                <h4 className="text-md font-semibold mb-4 text-gray-100">
                  Courses:
                </h4>
                {userCourses[userId]?.length > 0 ? (
                  <ul className="list-disc pl-6 space-y-4">
                    {userCourses[userId].map((course, index) => (
                      <li key={index} className="text-sm text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-100">
                            {course.title}
                          </span>
                          <div className="flex items-center mt-2">
                            <Progress
                              value={course.progress}
                              variant={
                                course.progress === 100 ? "success" : "default"
                              }
                            />
                            <span className="ml-3 text-xs text-gray-400">
                              {Math.round(course.progress)}%
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-300">No Courses Enrolled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Chart data={data} />
      <DataTable columns={columns} data={pcourses} newButton={false} />
      {/* <NoteChart data={notedata || []} /> */}
      <NoteDataTable columns={notecolumns} data={pnotes} newButton={true} />
    </div>
  );
};

export default AnalyticsPage;
