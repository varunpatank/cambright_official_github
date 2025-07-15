// v0.0.01 salah
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

interface NoteProgressProps {
  variant?: "default" | "success";
  value: number;
  size?: "default" | "sm";
}
const colorByVariant = {
  default: "text-purple-400",
  success: "text-emerald-700",
};
const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};
export const NoteProgress = ({ value, variant, size }: NoteProgressProps) => {
  return (
    <div>
      <Progress className="h-2" value={value} variant={variant} />
      <p
        className={cn(
          "font-medium font-lg mt-2 text-purple-500",
          colorByVariant[variant || "default"],
          sizeByVariant[size || "default"]
        )}
      >
        {Math.round(value)}% Complete
      </p>
    </div>
  );
};
