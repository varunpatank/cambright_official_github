// v.0.0.01 salah

"use client";

import axios from "axios";
import { saveAs } from "file-saver";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter, CloudinaryData } from "@prisma/client";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  FileDown,
  Loader2,
  Lock,
  LockIcon,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { google, outlook, ics } from "calendar-link";
import { FcCalendar, FcGoogle, FcSmartphoneTablet } from "react-icons/fc";

interface VideoPlayerProps {
  playbackId: string;
  noteId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl: string | null;
  sessiondate: string | null;
  sessionlink: string | null;
  sessiontime: string | null;
}

const Player = dynamic(() => import("@/components/Player"), { ssr: false });

export const Videoplayer = ({
  isLocked,
  nextChapterId,
  chapterId,
  videoUrl,
  completeOnEnd,
  title,
  noteId,
  sessiondate,
  sessionlink,
  sessiontime,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/notes/${noteId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });
      }
      if (!nextChapterId) {
        confetti.onOpen();
      }
      toast.success("Video completed!");
      router.refresh();
      if (nextChapterId) {
        router.push(`/notes/${noteId}/chapters/${nextChapterId}`);
      }
    } catch {
      toast.error("Something went wrong..");
    }
  };
  const videoJsOptions = {
    techOrder: ["html5"],
    autoplay: false,
    controls: true,
    responsive: true,
    oncanplay: () => setIsReady(true),
    sources: [
      {
        src:
          videoUrl && videoUrl.startsWith('uploads/')
            ? `/api/video?path=${encodeURIComponent(videoUrl)}`
            : videoUrl || "",
        type: "video/mp4",
      },
    ],
  };

  const saveFile = () => {
    saveAs(videoUrl || "", `${title} video`);
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const ordinal = (n: number) => {
      const suffix = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
    };
    return `${ordinal(day)} of ${month}, ${year}`;
  };

  const getWeekday = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long" }; // Use 'long', 'short', or 'narrow'
    return date.toLocaleDateString("en-US", options);
  };

  const dateToDisplay =
    typeof sessiondate === "string" ? parseDate(sessiondate) : null;

  const formattedDate = dateToDisplay ? formatDate(dateToDisplay) : "";
  const weekday = dateToDisplay ? getWeekday(dateToDisplay) : "";

  const combineDateTime = (
    sessiondate: string | null,
    sessiontime: string | null
  ): string | null => {
    if (!sessiondate || !sessiontime) return null;

    const dateParts = sessiondate.split("-");
    if (dateParts.length !== 3) return null;

    const [dayStr, monthStr, yearStr] = dateParts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      day < 1 ||
      month < 0 ||
      month > 11
    )
      return null;

    const timeParts = sessiontime.split(":");
    if (timeParts.length !== 2) return null;

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    )
      return null;

    const localDate = new Date(year, month, day, hours, minutes);

    if (isNaN(localDate.getTime())) return null;

    const yearLocal = localDate.getFullYear();
    const monthLocal = String(localDate.getMonth() + 1).padStart(2, "0");
    const dayLocal = String(localDate.getDate()).padStart(2, "0");
    const hoursLocal = String(localDate.getHours()).padStart(2, "0");
    const minutesLocal = String(localDate.getMinutes()).padStart(2, "0");

    const localISODate = `${yearLocal}-${monthLocal}-${dayLocal}T${hoursLocal}:${minutesLocal}Z`;

    return localISODate;
  };

  const isoString = combineDateTime(sessiondate, sessiontime);
  console.log(isoString);

  const event = {
    title: `${title} online lesson`,
    description: "Cambright note online lesson",
    start: isoString ?? "",
    duration: [3, "hour"] as [number, "minute" | "hour" | "day"], // Tuple format for duration
  };
  const router = useRouter();
  const confetti = useConfettiStore();

  return (
    <>
      {videoUrl !== "" && videoUrl !== null && (
        <>
          <div
            className="relative aspect-video mt-2 video-container justify-center items-center"
            onContextMenu={(e) => e.preventDefault()}
          >
            {!isReady && !isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-950 rounded-md">
                <Loader2 className="h-10 w-10 animate-spin text-seconday" />
              </div>
            )}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-950/40 rounded-md">
                <Lock className="h-10 w-10 text-seconday mx-2 animate-pulse" />
                <p className="text-md">Enroll for free to unlock chapter</p>
              </div>
            )}
            {!isLocked && (
              <>
                <Player
                  {...videoJsOptions}
                  onReady={() => videoUrl}
                  onEnded={onEnd}
                />
              </>
            )}
          </div>
          {!isLocked && (
            <Button
              onClick={saveFile}
              className="bg-n-7 hover:bg-transparent mt-2"
            >
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Download
              </>
            </Button>
          )}
          {isLocked && (
            <Button
              onClick={() => {}}
              className="pointer-events-none bg-n-7 opacity-40 hover:bg-transparent mt-2"
              disabled={true}
            >
              <>
                <Lock className="h-4 w-4 mr-2" />
                Download
              </>
            </Button>
          )}
        </>
      )}
      <div>
        {(sessionlink !== null ||
          sessiondate !== null ||
          sessiontime !== null) &&
          !isLocked && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3 border-[rgb(30, 41, 59)] border-[1px] p-4 rounded-md">
              <div>
                <h1 className="text-2xl text-slate-300">
                  Online lesson{" "}
                  {sessiondate !== null || sessiontime !== null ? "at:" : null}
                </h1>
                {sessiontime && (
                  <h1 className="text-xl text-purple-100">{sessiontime}</h1>
                )}
                {sessiondate && (
                  <>
                    <h1 className="text-xl my-2">
                      {weekday && `${weekday}, `}
                      {formattedDate}
                    </h1>
                    {/* <Link
                      href={google(event)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Button
                        className={
                          "bg-gray-700 hover:bg-gray-500 text-white mr-2"
                        }
                      >
                        <CalendarCheck size={18} className="mr-1" />
                        Add to Calendar
                      </Button>
                    </Link> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-gray-700 hover:bg-gray-500 text-white mr-2">
                          <CalendarCheck size={18} className="mr-1" />
                          Add to Calendar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Add to Calendar</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <a
                            href={google(event)}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="flex items-center space-x-2 w-full"
                          >
                            <FcGoogle className="h-4 w-4" />
                            <span>Google</span>
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <a
                            href={outlook(event)}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="flex items-center space-x-2 w-full"
                          >
                            <FcCalendar className="h-4 w-4" />
                            <span>Outlook</span>
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <a
                            href={ics(event)}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="flex items-center space-x-2 w-full"
                          >
                            <FcSmartphoneTablet className="h-4 w-4" />
                            <span>ICS</span>
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                {sessionlink && (
                  <Link
                    href={sessionlink}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Button
                      className={
                        "bg-blue-900 hover:bg-blue-700 text-white mt-2"
                      }
                    >
                      <Play size={18} className="mr-1" />
                      Join
                    </Button>
                  </Link>
                )}
              </div>
              {sessiondate && (
                <div className="flex items-center mr-5">
                  <Calendar
                    mode="single"
                    selected={dateToDisplay || undefined}
                    className="rounded-md border pointer-events-none contentfitter"
                  />
                </div>
              )}
            </div>
          )}
        {(sessionlink !== null ||
          sessiondate !== null ||
          sessiontime !== null) &&
          isLocked && (
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
              <div className=" z-20 absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-xl rounded-md flex items-center justify-center pointer-events-none">
                <Lock size={48} className="text-white animate-pulse" />
              </div>

              <div className="relative z-10">
                <h1 className="text-2xl text-slate-300">
                  Online lesson{" "}
                  {sessiondate !== null || sessiontime !== null ? "at:" : null}
                </h1>{" "}
                {sessiondate && (
                  <>
                    <h1 className="text-xl my-2">LOCKED</h1>
                    <Link href="#" className="pointer-events-none">
                      <Button
                        className={
                          "bg-gray-700 hover:bg-gray-500 text-white mr-2"
                        }
                        disabled={true}
                      >
                        <Lock size={18} className="mr-1" />
                        Add to Calendar
                      </Button>
                    </Link>
                  </>
                )}
                {sessionlink && (
                  <Link href={"#"} className="pointer-events-none">
                    <Button
                      className={
                        "bg-blue-900 hover:bg-blue-700 text-white mt-2"
                      }
                      disabled={true}
                    >
                      <Lock size={18} className="mr-1" />
                      Join
                    </Button>
                  </Link>
                )}
              </div>
              {sessiondate && (
                <div className="flex items-center mr-5 relative z-10">
                  <Calendar
                    mode="single"
                    selected={new Date() || undefined}
                    className="rounded-md border pointer-events-none contentfitter"
                  />
                </div>
              )}
            </div>
          )}
      </div>
    </>
  );
};
