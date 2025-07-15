// v0.0.01 salah
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-n-6 text-white border-n-5 border-2 border-b-4 active:border-b-2 hover:bg-n-7",
        tert: "bg-purple-800 text-white border-purple-900 border-0 border-b-4 active:border-b-0 hover:bg-purple-800/90",
        outline: "bg-transparent text-purple-600 hover:bg-n-6",
        secondary:
          "bg-green-500 text-white border-green-700 border-0 border-b-4 active:border-b-0 hover:bg-green-500/90",
        secondaryoutline:
          "bg-transparent text-white text-green-600 hover:bg-n-6",
        danger:
          "bg-rose-500 text-white border-rose-700 border-0 border-b-4 active:border-b-0 hover:bg-rose-500/90",
        dangeroutline: "bg-transparent text-white text-rose-600 hover:bg-n-6",
        super:
          "bg-yellow-500/90 text-white border-yellow-700 border-0 border-b-4 active:border-b-0 hover:bg-yellow-500/70",
        superoutline: "bg-transparent text-white text-yellow-600 hover:bg-n-6",
        sidebar:
          "bg-transparent text-slate-200 border-transparent transition-none  hover:bg-n-7",
        sidebaroutline: "bg-n-6",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9  px-3",
        lg: "h-12  px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const LearnButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
LearnButton.displayName = "Button";

export { LearnButton, buttonVariants };
