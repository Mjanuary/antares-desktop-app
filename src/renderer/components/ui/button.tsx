import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "../loading";

import classNames from "classnames";
const buttonVariants = cva(
  "inline-flex p-2 items-center justify-center whitespace-nowrap rounded-md !text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 print:hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gray-400 border-0 text-white border-gray-100/20 border shadow hover:bg-gray-100 text-sm dark:text-white dark:hover:bg-gray-100 ",
        primary:
          "bg-primary-300 border-0 border-- text-white shadow hover:bg-primary-400 text-sm dark:hover:bg-primary-200 dark:border-primary-200 ",
        "primary-light":
          "bg-primary-100/30 hover:text-white text-primary-300 border-0 shadow hover:bg-primary-400 text-sm dark:bg-primary-200/20 dark:text-primary-100 dark:hover:bg-primary-200/40 dark:border-primary-200 ",
        destructive:
          "bg-red-200 dark:bg-opacity-80 dark:hover:bg-opacity-100  dark:hover:text-white text-sm text-red-900 shadow-sm hover:bg-red-300 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-600",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-gray-100/80 hover:bg-gray-100 dark:bg-gray-500 dark:text-secondary-white shadow-sm dark:hover:bg-gray-400 text-sm",
        "primary-ghost": "hover:bg-accent text-primary-200 hover:underline",
        ghost: "hover:bg-accent hover:text-primary-400 hover:underline",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 !text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm-rounded": "!p-1.5 border-transparent !rounded-full",
        "no-size": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, icon, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {!props.disabled && loading ? (
          <span className="">
            <span className="block h-0 overflow-hidden">{props.children}</span>
            <Spinner className="mx-auto" spinnerClassName="text-xl" />
          </span>
        ) : icon ? (
          <span className="flex items-center gap-1">
            {icon}
            {props.children}
          </span>
        ) : (
          props.children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
