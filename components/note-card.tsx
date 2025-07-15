// v0.0.01 salah
import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "./icon-badge";
import { BadgeCheck, BookOpen, Check, Gem, Play } from "lucide-react";
import { getUserFirstName } from "@/lib/clerkername";
import { getUserIMGURL } from "@/lib/clerkerimage";
import { NoteProgress } from "./note-progress";

interface NoteCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  progress: number | null;
  subject: string;
  board: string;
  isOnline: boolean;
  noteOwner: string;
  zoomed?: string;
  showChaps?: boolean;
  smth?: string;
}

const fallbackImageURL = "https://cdn-icons-png.freepik.com/512/194/194935.png";

export const NoteCard = async ({
  id,
  zoomed,
  title,
  imageUrl,
  chaptersLength,
  smth,
  progress,
  subject,
  showChaps = true,
  board,
  isOnline,
  noteOwner,
}: NoteCardProps) => {
  const noteOwnerName = await getUserFirstName(noteOwner);
  const noteOwnerIMGURL = await getUserIMGURL(noteOwner);

  return (
    <Link href={`/notes/${id}`}>
      <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full bg-slate-950">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            fill
            className={` ${zoomed} object-cover`}
            alt={title}
            src={imageUrl}
          />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-xl md:text-base font-medium group-hover:text-purple-500 transition line-clamp-2 flex">
            {title}
            <h1 className="text-sm pt-1 text-muted-foreground ml-1">{smth}</h1>
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
              {chaptersLength > 0 && showChaps && (
                <>
                  <IconBadge size={"sm"} icon={BookOpen} />
                  <span>
                    {chaptersLength} {chaptersLength === 1 ? "Topic" : "Topics"}
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
            <NoteProgress
              size="sm"
              value={progress}
              variant={progress === 100 ? "success" : "default"}
            />
          ) : (
            <Link href={"/dashboard"} className="z-10">
              <button className="flex items-center text-slate-400 hover:text-slate-500 transition  rounded-full px-2 py-1  mt-2 justify-start contentfitter">
                <span className="text-sm font-medium mr-2">by:</span>
                <div className="relative w-5 h-5 mr-1">
                  <Image
                    fill
                    className="rounded-full object-cover"
                    src={noteOwnerIMGURL || fallbackImageURL}
                    alt={noteOwnerName || "Note Owner"}
                    sizes="20px"
                  />
                </div>
                <span className="text-xs font-medium">
                  {noteOwnerName || "Tutor"}
                </span>
                <BadgeCheck className="w-4 h-4 ml-1" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
};
