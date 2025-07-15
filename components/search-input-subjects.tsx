"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputSubjectsProps {
  setSearchTerm: (term: string) => void;
}

export const SearchInputSubjects = ({
  setSearchTerm,
}: SearchInputSubjectsProps) => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);

  useEffect(() => {
    setSearchTerm(debouncedValue);
  }, [debouncedValue, setSearchTerm]);

  return (
    <div className="relative flex justify-center">
      <Search className="h-5 w-5 absolute top-3 left-3 text-gray-400" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[400px] pl-10 rounded-full"
        placeholder="Search for a subject..."
      />
    </div>
  );
};
