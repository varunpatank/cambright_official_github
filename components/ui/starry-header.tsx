"use client";

import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
import { cn } from "@/lib/utils";

interface StarryHeaderProps {
  title: string;
  subtitle?: string;
  /** Color for the highlighted word - default purple-400 */
  highlightColor?: string;
  /** Height of the starry section */
  height?: string;
  /** Intensity of particles - "low" | "medium" | "high" */
  intensity?: "low" | "medium" | "high";
  /** Additional className */
  className?: string;
  /** Icon component to show before title */
  icon?: React.ReactNode;
}

export function StarryHeader({
  title,
  subtitle,
  highlightColor = "text-purple-400",
  height = "160px",
  intensity = "medium",
  className,
  icon,
}: StarryHeaderProps) {
  // Split title by * to find highlighted parts
  // e.g., "Browse *Courses*" -> ["Browse ", "Courses", ""]
  const parts = title.split(/\*(.*?)\*/);

  return (
    <StarryBackground height={height} intensity={intensity} className={cn("mb-8", className)}>
      <div className="flex items-center justify-center h-full py-6">
        <Cover className="inline-block px-8 py-4 bg-neutral-900/60 rounded-xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3">
              {icon}
              {parts.map((part, index) => (
                <span key={index} className={index % 2 === 1 ? highlightColor : ""}>
                  {part}
                </span>
              ))}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-gray-300 mt-3">{subtitle}</p>
            )}
          </div>
        </Cover>
      </div>
    </StarryBackground>
  );
}

export default StarryHeader;
