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
        "relative flex items-center text-base font-[500] pl-6 transition-all cursor-pointer w-full hover:text-slate-500 hover:bg-n-8",
        isOpen && "text-purple-500 bg-n-8 hover:bg-n-8 hover:text-purple-600"
      )}
    >
      <div className="flex items-center text-slate-500 gap-x-2 py-4 w-full">
        <Icon size={24} className={cn("text-slate-500", isOpen && "text-purple-500")} />
        {label}
        <ChevronDown
          size={20}
          className={cn(
            "transition-transform duration-300 ml-auto mr-3",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </div>
      <div
        className={cn(
          "absolute right-0 top-0 h-full opacity-0 border-2 border-purple-600 transition-all",
          isOpen && "opacity-100"
        )}
      />
    </div>
  );
};
