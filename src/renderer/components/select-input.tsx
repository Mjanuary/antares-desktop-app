import React, { FunctionComponent, ReactNode } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "./ui/select";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils/cn";
import classNames from "classnames";

export type SelectItemComponent = {
  label: string;
  value: string;
};

export type SelectGroupComponent = {
  groupTitle?: string;
  options: SelectItemComponent[];
};

export interface Props extends VariantProps<typeof inputVariants> {
  className?: string;
  options: SelectGroupComponent[];
  onValueChange?: (value: string) => void;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  error?: string;
  titleClassName?: string;
  title?: string | ReactNode;
  lastCustomOption?: React.ReactNode;
  size?: "md" | "sm" | "lg";
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

export const SelectInput: FunctionComponent<Props> = ({
  options,
  className,
  disabled,
  error,
  onValueChange,
  placeholder,
  value,
  titleClassName,
  inputVariant,
  inputSize,
  title,
  lastCustomOption,
  // size,
}) => {
  return (
    <div className="w-full">
      {title && (
        <span
          className={cn(
            "mb-1 block text-sm capitalize text-base-color ",
            titleClassName
          )}
        >
          {title}
        </span>
      )}
      <Select
        defaultValue={value}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          className={classNames(
            cn(inputVariants({ inputVariant, inputSize, className })),
            {
              "!border-red-500": error,
            }
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className=" text-black dark:text-white bg-parent">
          {options.map((option, key) => {
            return (
              <SelectGroup key={option.groupTitle || key}>
                {option.groupTitle && (
                  <SelectLabel className="opacity-60">
                    {option.groupTitle}
                  </SelectLabel>
                )}
                {option.options.map((option, key) => (
                  <SelectItem
                    className="hover:bg-green-400/20"
                    key={key}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}

          {lastCustomOption}
        </SelectContent>
      </Select>
      {error && (
        <label className="text-xs text-red-500 mb-1 block mt-0.5 ">
          {error}
        </label>
      )}
    </div>
  );
};
