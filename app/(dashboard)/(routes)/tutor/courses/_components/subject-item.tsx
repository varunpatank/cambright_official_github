"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconType } from "react-icons/lib";
import qs from "query-string";

interface SubjectItemProps {
  label: string;
  value?: string;
  icon?: IconType;
}

const SubjectItem = ({ label, value, icon: Icon }: SubjectItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSubjectId = searchParams?.get("subjectId");
  const currentTitle = searchParams?.get("title");

  const isSelected = currentSubjectId === value;

  const onClick = () => {
    const newQuery = {
      title: currentTitle,
      subjectId: isSelected ? undefined : value, // Remove subjectId if it's selected again
    };

    const url = qs.stringifyUrl(
      {
        url: pathname || "/dashboard", // Fallback to root if pathname is undefined
        query: newQuery,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "py-2 px-3 border border-secondary text-sm rounded-full flex items-center gap-x-1 hover:border-purple-700",
        isSelected && "bg-purple-800 text-white"
      )}
      type="button"
    >
      {Icon && <Icon size={20} />}
      <div className="truncate">{label}</div>
    </button>
  );
};

export default SubjectItem;
