import { useTaskModal } from "@/hooks/use-task-modal";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface EventCardProps {
  title: string;
  sprint: string;
  id: string;
  list: string;
  date: Date;
}

export const EventCard = ({
  title,
  sprint,
  date,
  id,
  list,
}: EventCardProps) => {
  const taskModal = useTaskModal();

  // Check if the date has passed
  const isDatePassed = useMemo(() => {
    const currentDate = new Date();
    return date < currentDate; // Task due date is in the past
  }, [date]);

  return (
    <div className="px-2 relative">
      <div
        className={cn(
          "p-1.5 mb-1 text-xs bg-n-6 border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition ",
          list.toLocaleLowerCase().includes("progress")
            ? "border-l-yellow-400"
            : list.toLocaleLowerCase().includes("complete") ||
              list.toLocaleLowerCase().includes("done")
            ? "border-l-green-400"
            : list.toLocaleLowerCase().includes("undone") ||
              list.toLocaleLowerCase().includes("incomplete")
            ? "border-l-red-400"
            : "border-l-purple-500"
        )}
        onClick={() => taskModal.onOpen(id)}
      >
        <p>{title}</p>{" "}
      </div>
    </div>
  );
};
