"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Utility for conditional class names
import { HomeIcon } from "lucide-react"; // Import HomeIcon from lucide-react

const FloatingNavbar = () => {
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter((segment) => segment);

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 p-2 bg-slate-800 text-white shadow-md z-50 rounded-full w-[95%] max-w-[800px] mb-0 md-contentfitter">
      <nav className="flex items-center space-x-2 overflow-auto">
        {/* Home Icon Link */}
        <Link href="/past-papers" className="flex items-center">
          <HomeIcon className="text-white hover:text-gray-400" />
        </Link>

        {/* Path Segments */}
        {pathSegments?.map((segment, index) => {
          const segmentPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isActive = pathname === segmentPath;

          // Skip rendering "past-papers" text but still include its path segment
          if (segment === "past-papers") return null;

          return (
            <span key={index} className="flex items-center">
              {index > 0 && <span className="text-gray-400 mr-2"> &gt; </span>}
              <Link
                href={segmentPath}
                className={cn(
                  "px-3 py-1 rounded-full transition-colors duration-300 whitespace-nowrap",
                  {
                    "bg-slate-700": isActive,
                    "hover:bg-slate-600": !isActive,
                  }
                )}
              >
                {segment}
              </Link>
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default FloatingNavbar;
