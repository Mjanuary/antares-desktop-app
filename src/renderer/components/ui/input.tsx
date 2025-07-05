import { cn } from "../../utils/cn";
import { VariantProps, cva } from "class-variance-authority";
import classNames from "classnames";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string | React.ReactNode;
  titleClassName?: string;
  error?: string;
  info?: string;
  warning?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const inputVariants = cva(
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
        default: "h-9 px-3 py-1 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-3 text-lg",
        xl: "h-12 px-3 text-xl",
      },
    },
    defaultVariants: {
      inputVariant: "default",
      inputSize: "default",
    },
  }
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputVariant,
      inputSize,
      label,
      titleClassName,
      type,
      error,
      info,
      warning,
      inputClassName,
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={classNames(containerClassName, {
          "w-full": !!containerClassName,
        })}
      >
        {label && (
          <span
            className={cn(
              "mb-1 block text-sm text-base-color whitespace-nowrap w-fit",
              titleClassName
            )}
          >
            {label}
          </span>
        )}
        <input
          type={type}
          className={classNames(
            cn(inputVariants({ inputVariant, inputSize, className })),
            {
              "border !border-red-500": error,
              "border !border-yellow-600": warning,
              "border !border-blue-400": info,
            },
            inputClassName
          )}
          ref={ref}
          step={type === "number" ? "0.01" : undefined}
          {...props}
        />
        {error && (
          <label className="text-xs text-red-500 mb-1 block mt-0.5 ">
            {error}
          </label>
        )}
        {warning && (
          <label className="text-xs text-yellow-600 mb-1 block mt-0.5 ">
            {warning}
          </label>
        )}
        {info && (
          <label className="text-xs text-blue-500 mb-1 block mt-0.5 ">
            {info}
          </label>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
