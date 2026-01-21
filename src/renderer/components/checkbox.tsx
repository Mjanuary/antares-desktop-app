import * as React from "react";
import classNames from "classnames";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<"button"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      data-slot="checkbox"
      className={classNames(
        "peer bg-white border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      onClick={(e) => {
        onCheckedChange?.(!checked);
        props.onClick?.(e);
      }}
    >
      <span
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {checked ? (
          <MdCheckBox className="size-3.5" />
        ) : (
          <MdCheckBoxOutlineBlank className="size-3.5" />
        )}
      </span>
    </button>
  );
}

export { Checkbox };
