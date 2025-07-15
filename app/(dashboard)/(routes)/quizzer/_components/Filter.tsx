import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterProps {
  subjects: string[];
  years: string[];
  topics: string[];
  variants: string[];
  sessions: string[];
  type: string[];
  onFilterChange: (filters: any) => void;
  selectedSubject: string;
}

const Filter: React.FC<FilterProps> = ({
  subjects,
  years,
  topics,
  type,
  variants,
  sessions,
  onFilterChange,
  selectedSubject,
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const isDisabled = !selectedSubject;

  const handleSubjectChange = (value: string) => {
    onFilterChange({
      subject: value,
      year: "All",
      topic: selectedTopics,
      variant: "All",
      session: "All",
      type: "All",
      difficulty: "Medium",
    });
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleYearChange = (startYear: string, endYear: string) => {
    onFilterChange({
      year: `${startYear} - ${endYear}`,
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex-1">
          <label className="text-xl text-white">Subject:</label>
          <Select onValueChange={handleSubjectChange}>
            <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem
                  key={subject}
                  value={subject}
                  className="text-white text-lg"
                >
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-xl text-white mb-2">Year Range:</label>
          <div className="flex items-center">
            <input
              type="number"
              placeholder="from"
              className="w-full py-2 px-4 text-lg mt-2 mb-4 text-white bg-[#09090B] rounded-md border-[1px]"
              onChange={(e) => handleYearChange(e.target.value, "")}
            />
            <span className="mx-2 text-white">-</span>
            <input
              type="number"
              placeholder="present"
              className="w-full py-2 px-4 text-lg mt-2 mb-4 text-white bg-[#09090B] rounded-md border-[1px]"
              onChange={(e) => handleYearChange("", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex-1">
          <label className="text-xl text-white mb-4">Topics:</label>
          <div className="flex flex-col mt-2">
            {topics.length !== 0
              ? topics.map((topic) => (
                  <label
                    key={topic}
                    className="flex items-center mb-1 text-white"
                  >
                    <Checkbox id={topic} className="mr-2" />

                    {topic}
                  </label>
                ))
              : "Select Subject first"}
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xl text-white mb-2">Variant:</label>
          <Select
            onValueChange={(value) => onFilterChange({ variant: value })}
            disabled={isDisabled}
          >
            <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem
                  key={variant}
                  value={variant}
                  className="text-white text-lg"
                >
                  {variant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex-1">
          <label className="text-xl text-white mb-2">Session:</label>
          <Select
            onValueChange={(value) => onFilterChange({ session: value })}
            disabled={isDisabled}
          >
            <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem
                  key={session}
                  value={session}
                  className="text-white text-lg"
                >
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-xl text-white mb-2">Board/Type:</label>
          <Select
            onValueChange={(value) => onFilterChange({ board: value })}
            disabled={isDisabled}
          >
            <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
              <SelectValue placeholder="Extended" />
            </SelectTrigger>
            <SelectContent>
              {type.map((typ) => (
                <SelectItem
                  key={typ}
                  value={typ}
                  className="text-white text-lg"
                >
                  {typ}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>{" "}
      </div>
      <div>
        <label className="text-xl text-white mb-2">Difficulty:</label>
        <Select
          onValueChange={(value) => onFilterChange({ difficulty: value })}
        >
          <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
            <SelectValue placeholder="Medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="Easy"
              className="text-green-200 hover:text-green-300 text-lg"
            >
              Easy
            </SelectItem>
            <SelectItem
              value="Medium"
              className="text-orange-200 hover:text-orange-300 text-lg"
            >
              Medium
            </SelectItem>
            <SelectItem
              value="Hard"
              className="text-red-200 hover:text-red-300 text-lg"
            >
              Hard
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xl text-white mb-2">Paper:</label>
        <Select onValueChange={(value) => onFilterChange({ paper: value })}>
          <SelectTrigger className="text-white w-full py-2 px-4 text-lg mt-2 mb-4">
            <SelectValue placeholder="Paper 2 (MCQ)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paper 2 (MCQ)" className="text-lg">
              Paper 2 (MCQ)
            </SelectItem>
            <SelectItem value="Paper 4 (Theory)" className=" text-lg">
              Paper 4 (Theory)
            </SelectItem>
            <SelectItem value="Paper 6 (Practical)" className=" text-lg">
              Paper 6 (Practical)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Filter;
