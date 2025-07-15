// v.0.0.01 salah

"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive =
    (pathname === "/dashboard" && href === "/dashboard") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-500 hover:bg-n-6 ",
        isActive && "text-purple-500 bg-n-8 hover:bg-n-8 hover:text-purple-600"
      )}
    >
      <div className="flex items-center gap-x-2 py-4 ">
        <Icon
          size={22}
          className={cn("text-slate-500", isActive && "text-purple-500")}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-purple-600 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};
