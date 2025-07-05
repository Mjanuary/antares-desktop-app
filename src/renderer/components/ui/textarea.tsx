import { cn } from "../../utils/cn";
import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const textAreaVariant = cva(
  "flex w-full rounded-md border border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputVariant: {
        default:
          "border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff]",
        danger:
          "border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff]",
        success:
          "border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff]",
        info: "border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff]",
      },
      inputSize: {
        default: "min-h-[80px] px-3 py-1 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "min-h-[40px] px-3 text-lg",
        xl: "min-h-[40px] px-3 text-xl",
      },
    },
    defaultVariants: {
      inputVariant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariant> {
  label?: string;
  titleClassName?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, InputProps>(
  (
    {
      className,
      inputVariant,
      inputSize,
      label,
      titleClassName,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <span
            className={cn(
              "mb-1 block text-sm capitalize text-base-color",
              titleClassName
            )}
          >
            {label}
          </span>
        )}
        <textarea
          className={cn(
            textAreaVariant({ inputVariant, inputSize, className })
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <label className="text-xs text-red-300 mb-1 block mt-0.5 ">
            {error}
          </label>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
