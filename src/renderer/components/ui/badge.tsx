import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 !text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        danger:
          "border-transparent bg-red-200 text-red-900 dark:text-red-200  dark:bg-red-600/40",
        success:
          "border-transparent bg-green-200 text-green-900 dark:text-green-200  dark:bg-green-600/40",
        purple:
          "border-transparent text-[#8754F3] bg-[#F3EEFE]  dark:text-[#F3EEFE] dark:bg-[#8654f35b]",
        info: "border-transparent bg-blue-200 text-blue-900 dark:text-blue-200  dark:bg-blue-600/40",
        warning:
          "border-transparent bg-yellow-200 text-yellow-900 dark:text-yellow-200  dark:bg-yellow-600/40",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className, "whitespace-nowrap")}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
