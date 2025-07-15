// v.0.0.01 salah

"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface NoteSideBarItemProps {
  label: string;
  id: string;
  noteId: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export const NoteSidebarItem = ({
  label,
  id,
  noteId,
  isLocked,
  isCompleted,
}: NoteSideBarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle;
  const isActive = pathname?.includes(id);

  const Onclick = () => {
    router.push(`/notes/${noteId}/chapters/${id}`);
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
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={23}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-300",
            isCompleted && "text-emerald-700"
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-violet-600 h-full transition-all",
          isActive && "opacity-100",
          isCompleted && " border-emerald-700 "
        )}
      />
    </button>
  );
};
