import React, { useState, useEffect } from "react";
import { subjects } from "../data/subjects_drop";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming cn is a utility function for conditional classes
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

interface SubjectDropProps {
  onSubjectChange: (subject: string) => void;
  onTopicsChange: (topics: string[]) => void;
}

const SubjectDrop: React.FC<SubjectDropProps> = ({
  onSubjectChange,
  onTopicsChange,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Handle the selection of the subject from the popover
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setValue(subject); // Update the value to show in the button
    onSubjectChange(subject);

    // Find the topics for the selected subject and update the topics
    const subjectData = subjects.find((sub) => sub.name === subject);
    if (subjectData) {
      // Select all topics initially for the subject
      setSelectedTopics(subjectData.topics.map((topic) => topic.name));
      onTopicsChange(subjectData.topics.map((topic) => topic.name));
    }
    setOpen(false); // Close the popover once the subject is selected
  };

  // Handle topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopics((prev) => {
      const newSelectedTopics = prev.includes(topic)
        ? prev.filter((t) => t !== topic) // Deselect if already selected
        : [...prev, topic]; // Add topic if not selected

      // Call onTopicsChange with the updated selected topics
      onTopicsChange(newSelectedTopics);
      return newSelectedTopics; // Update the state
    });
  };

  useEffect(() => {
    // Update the topics whenever the subject changes
    const subjectData = subjects.find((sub) => sub.name === selectedSubject);
    if (subjectData) {
      const allTopics = subjectData.topics.map((topic) => topic.name);
      setSelectedTopics(allTopics); // Select all topics initially
      onTopicsChange(allTopics); // Ensure the parent component gets the updated list of topics
    }
  }, [selectedSubject, onTopicsChange]);

  return (
    <div className="space-y-4 pl-0 md:pl-8">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px]  text-lg justify-between bg-n-6 border-n-6 hover:bg-n-7"
          >
            {value || "Select Subject..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-n-7">
          <Command className="bg-n-7">
            <CommandInput placeholder="Search Subjects..." className="bg-n-7" />
            <CommandList className="bg-n-7">
              <CommandEmpty>No subject found.</CommandEmpty>
              <CommandGroup>
                {subjects.map((sub) => (
                  <CommandItem
                    key={sub.name}
                    value={sub.name}
                    onSelect={() => handleSubjectChange(sub.name)} // When a subject is selected, trigger handleSubjectChange
                  >
                    {sub.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === sub.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSubject && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Select Topics:</h4>
          <div className="space-y-2">
            {" "}
            {/* Added space-y-2 to create vertical spacing */}
            {subjects
              .find((sub) => sub.name === selectedSubject)
              ?.topics.map((topic) => (
                <div
                  className="flex items-center space-x-2" // space-x-2 for horizontal spacing between checkbox and label
                  key={topic.id}
                >
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.name)} // Check if the topic is selected
                    onCheckedChange={() => handleTopicChange(topic.name)} // Update the selection when checkbox is toggled
                  />
                  <label
                    htmlFor={topic.id}
                    className="text-lg leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {topic.name}
                  </label>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDrop;
