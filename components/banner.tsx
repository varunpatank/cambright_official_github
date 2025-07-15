// v0.0.01 salah
import { AlertTriangle, CheckCircleIcon, PartyPopperIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const BannerVariants = cva(
  "border text-center p-4 text-sm flex items-center w-full",
  {
    variants: {
      variant: {
        warning: "bg-n-6 border-none text-yellow-300",
        success: "bg-emerald-700/80 border-emerald-30 text-white",
        party: "bg-emerald-700/80 border-emerald-30 text-white",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);
interface BannerProps extends VariantProps<typeof BannerVariants> {
  label: string;
}
const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
  party: PartyPopperIcon,
};
export const Banner = ({ label, variant }: BannerProps) => {
  const Icon = iconMap[variant || "warning"];
  return (
    <div className={cn(BannerVariants({ variant }))}>
      <Icon className="h-6 w-6 mr-2" />
      {label}
    </div>
  );
};
