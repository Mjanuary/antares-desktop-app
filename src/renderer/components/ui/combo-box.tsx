import * as React from "react";
import { MdCheck, MdArrowDownward } from "react-icons/md";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
// } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import classNames from "classnames";

export const Combobox: React.FunctionComponent<{
  label: string | React.ReactNode;
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}> = ({
  label,
  options,
  onChange,
  value,
  disabled = false,
  loading,
  error,
}) => {
  const [open, setOpen] = React.useState(false);

  const setOpenHandler = (value: boolean) => {
    if (disabled || loading) return;
    setOpen(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpenHandler}>
      <PopoverTrigger asChild>
        <button aria-expanded={open} className="text-left w-full">
          <span className="mb-1 block text-sm capitalize text-base-color">
            {label}
          </span>
          <div
            className={classNames(
              "w-full flex items-center  justify-between rounded-md border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff] h-9 px-3 py-1 text-sm",
              {
                "bg-app-gray-animated ": loading,
                "!border-red-400": error,
              }
            )}
          >
            <span>
              {value ? (
                options.find((framework) => framework.value === value)?.label
              ) : (
                <span
                  className={classNames("opacity-35", {
                    "!opacity-0": loading,
                  })}
                >
                  Select a value
                </span>
              )}
            </span>

            <MdArrowDownward className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
          {error && (
            <span className="text-xs text-red-500 dark:text-red-400 block">
              {error}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] bg-white dark:bg-gray-700 p-0">
        <Command className="p-0">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>
              <span className="opacity-35">No results found.</span>
            </CommandEmpty>
            <CommandGroup>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <MdCheck
                    className={classNames(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
