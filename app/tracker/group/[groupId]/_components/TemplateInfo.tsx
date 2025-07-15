"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import { ZapIcon } from "lucide-react";
import Image from "next/image";
interface InfoProps {
  num: Number;
  name: String;
}
export const TemplateInfo = ({ num, name }: InfoProps) => {
  const { organization, isLoaded } = useOrganization();
  if (!isLoaded) {
    return (
      <div>
        <TemplateInfo.Skeleyon />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[60px] h-[60px] relative">
        <Image
          fill
          src="/logor.png"
          alt="group"
          className="hover:scale-110 transition-all rounded-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-xl">Templates</p>
        <div className="flex items-center text-xs text-muted-foreground">
          Don&apos;t waste time planning!
        </div>
      </div>
    </div>
  );
};

TemplateInfo.Skeleyon = function SkInfo() {
  return (
    <div className="flex items-center gap-x-4">
      {/* Square */}
      <div className="w-[60px] h-[60px] rounded-full relative">
        <Skeleton className="w-full h-full rounded-full" />
      </div>

      {/* Rectangles stacked vertically */}
      <div className="flex flex-col gap-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};
