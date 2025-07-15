"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface CourseSideBarItemProps {
  label: string;
  id: string;
  courseId: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  courseId,
  isLocked,
  isCompleted,
}: CourseSideBarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle;
  const isActive = pathname?.includes(id);

  const Onclick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };
  return (
    <button
      onClick={Onclick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-md font-[500] pl-6 transition-all hover:text-slate-400 hover:bg-n-6/70",
        isActive &&
          "text-slate-300 bg-n-6/40 hover:text-slate-300 hover:bg-n-6/40",
        isCompleted && "text-emerald-700 hover:text-emerald-500"
      )}
    >
      <div className="flex items-center gap-x-2 py-4 w-full overflow-hidden">
        {/* Icon */}
        <Icon
          size={23}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-300",
            isCompleted && "text-emerald-700",
            "flex-shrink-0" // Prevents icon from shrinking
          )}
        />

        {/* Chapter Title */}
        <span
          className={cn(
            "flex-1 text-left text-ellipsis overflow-hidden whitespace-nowrap", // Truncate text if it's too long
            isActive && "text-slate-300",
            isCompleted && "text-emerald-700"
          )}
        >
          {label}
        </span>
      </div>

      {/* Active State Highlight */}
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-violet-600 h-full transition-all",
          isActive && "opacity-100",
          isCompleted && "border-emerald-700"
        )}
      />
    </button>
  );
};
