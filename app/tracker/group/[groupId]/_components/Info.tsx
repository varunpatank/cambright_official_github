"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import { ZapIcon } from "lucide-react";
import Image from "next/image";
interface InfoProps {
  num: Number;
  name: String;
}
export const Info = ({ num, name }: InfoProps) => {
  const { organization, isLoaded } = useOrganization();
  if (!isLoaded) {
    return (
      <div>
        <Info.Skeleyon />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-x-4">
      <div className="w-[60px] h-[60px] relative">
        <Image
          fill
          src={organization?.imageUrl!}
          alt="group"
          className="hover:rounded-xl transition-all rounded-md object-cover"
        />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-xl">{organization?.name}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <ZapIcon className="mr-1 h-3 w-3" />
          {num.toString()} {name}
        </div>
      </div>
    </div>
  );
};

Info.Skeleyon = function SkInfo() {
  return (
    <div className="flex items-center gap-x-4">
      {/* Square */}
      <div className="w-[60px] h-[60px] relative">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Rectangles stacked vertically */}
      <div className="flex flex-col gap-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};
