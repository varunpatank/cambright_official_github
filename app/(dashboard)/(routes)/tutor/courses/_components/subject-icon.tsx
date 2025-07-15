"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconType } from "react-icons/lib";

interface SubjectItemProps {
  icon?: IconType;
}

const SubjectIcon = ({ icon: Icon }: SubjectItemProps) => {
  return <>{Icon && <Icon size={20} />}</>;
};

export default SubjectIcon;
