// v.0.0.01 salah

"use client";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown } from "lucide-react";

interface SidebarAccordProps {
  icon: LucideIcon;
  label: string;
  isOpen: boolean;
}

export const SidebarAccord = ({
  icon: Icon,
  label,
  isOpen,
}: SidebarAccordProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-2 text-sm font-[500] pl-6 transition-all cursor-pointer w-full hover:text-slate-500 hover:bg-n-8"
      )}
    >
      <div className="flex items-center text-slate-500 gap-x-2 py-4 w-full">
        <Icon size={22} className={cn("text-slate-500")} />
        {label}
        <ChevronDown
          size={20}
          className={cn(
            "transition-transform duration-300 ml-auto mr-3",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </div>
    </div>
  );
};
