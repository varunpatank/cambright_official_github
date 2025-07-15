// v0.0.01 salah
import React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface DatePickerWithPresetsProps {
  onDateChange: (dateString: string) => void;
  initialValue?: Date | undefined;
}

export function DatePickerWithPresets({
  onDateChange,
  initialValue,
}: DatePickerWithPresetsProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialValue);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (onDateChange && newDate !== undefined) {
      onDateChange(format(newDate, "dd-MM-yyyy"));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-full justify-start text-left font-normal mb-2 ${
            !date ? "text-muted-foreground" : ""
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select
          onValueChange={(value) =>
            handleDateChange(addDays(new Date(), parseInt(value)))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="0">Today</SelectItem>
            <SelectItem value="1">Tomorrow</SelectItem>
            <SelectItem value="3">In 3 days</SelectItem>
            <SelectItem value="7">In a week</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar mode="single" selected={date} onSelect={handleDateChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
