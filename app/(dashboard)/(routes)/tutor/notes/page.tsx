import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NoteDataTable } from "./_components/data-table";
import { notecolumns } from "./_components/columns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AlertCircle } from "lucide-react";
// export const maxDuration = 300;

const CoursesPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }
  const notes = await db.note.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <div className="bg-n-6/30 p-6 rounded-lg mb-6 flex flex-col items-start space-y-4">
        <div className="bg-n-6/30 p-6 rounded-lg mb-6 flex flex-col items-start space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-yellow-500">
            <AlertCircle className="h-6 w-6 sm:mr-3 mb-3 sm:mb-0 sm:w-8 sm:h-8" />
            <h1 className="text-lg sm:text-xl font-semibold">
              The notes editor is fairly limited as this is the beta release; it
              is <span className="font-semibold">strongly</span> recommended to
              submit any notes as a PDF (or any type) or link to a file.{" "}
              <span className="text-muted-foreground">
                You can also submit any{" "}
                <span className="text-purple-500">video</span> tutorials you
                have!
              </span>
            </h1>
          </div>
        </div>{" "}
        <Link
          rel="noopener noreferrer"
          target="_blank"
          className="w-full py-2"
          href="https://docs.google.com/forms/d/e/1FAIpQLSe2LTxSxhnaGdTRmEzxbMkS1K8Yo56i_2QZuDLv9qlvS-JxxQ/viewform"
        >
          <Button variant={"tert"} className="w-full py-2">
            Submit Notes
          </Button>
        </Link>
      </div>
      <NoteDataTable columns={notecolumns} data={notes} newButton={true} />
    </div>
  );
};

export default CoursesPage;
