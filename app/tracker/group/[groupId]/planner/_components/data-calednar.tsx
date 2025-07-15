// DataCalendar.tsx
"use client";
import { TaskWithSprintName } from "../page";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS } from "date-fns/locale";
import {
  getDay,
  startOfWeek,
  format,
  parse,
  subMonths,
  addMonths,
} from "date-fns";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./cutom.css";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRight } from "lucide-react";

interface DataCalendarProps {
  data: TaskWithSprintName[];
}

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}
const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center justify-center w-full lg:w-auto lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        size={"icon"}
        className="flex items-center"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        size={"icon"}
        className="flex items-center"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};
export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [value, setValue] = useState(() => {
    // Handle null `dueDate` here by falling back to the current date
    if (data.length > 0 && data[0].dueDate) {
      return new Date(data[0].dueDate); // valid Date
    } else {
      return new Date(); // fallback to current date if `dueDate` is null or no data
    }
  });

  // Mapping tasks to events for the calendar
  const events = data.map((task) => {
    // Get the dueDate and subtract one day
    const dueDate = task.dueDate ? new Date(task.dueDate) : new Date();
    dueDate.setDate(dueDate.getDate()); // Subtract 1 day

    return {
      start: dueDate,
      end: dueDate,
      title: task.title,
      description: task.description,
      id: task.id,
      sprint: task.sprintName,
      list: task.listName,
      // Access sprintName from the task
    };
  });
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };
  return (
    <div>
      {/* Render the calendar */}
      <Calendar
        localizer={localizer}
        date={value}
        events={events}
        views={["month"]}
        showAllEvents
        toolbar
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
          weekdayFormat: (date, culture, localizer) =>
            localizer?.format(date, "EEE", culture) ?? "",
        }}
        className="h-full"
        components={{
          eventWrapper: ({ event }) => (
            <EventCard
              id={event.id}
              sprint={event.sprint}
              title={event.title}
              list={event.list}
              date={event.end}
            />
          ),
          toolbar: () => (
            <CustomToolbar date={value} onNavigate={handleNavigate} />
          ),
        }}
      />
    </div>
  );
};
