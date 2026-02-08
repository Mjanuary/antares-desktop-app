import classNames from "classnames";
import { FunctionComponent, ReactNode } from "react";
import { MdOutlinePrint, MdOutlinePrintDisabled } from "react-icons/md";

export const PrintedSwitch: FunctionComponent<{
  title: string | ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
}> = ({
  title,
  value,
  onChange,
  // className,
  disabled,
}) => (
  <div className="flex flex-col">
    <h4 className="text-sm text-base-color pb-1 flex gap-1">{title}</h4>
    <div className="flex border border-color-theme rounded-xl p-0.5">
      <button
        onClick={() => onChange(true)}
        className={classNames(
          "flex-1 text-lg rounded-lg text-center min-w-11 p-1 opacity-50 hover:bg-blue-500/40",
          {
            "bg-blue-500/20 !text-blue-300 !opacity-100": value,
          },
        )}
        disabled={disabled}
      >
        <MdOutlinePrint className="mx-auto text-2xl" />
      </button>
      <button
        onClick={() => onChange(false)}
        className={classNames(
          "flex-1 text-lg rounded-lg min-w-11 text-center p-1 opacity-50 hover:bg-red-500/40",
          {
            "bg-red-500/20 !text-red-300 !opacity-100": !value,
          },
        )}
        disabled={disabled}
      >
        <MdOutlinePrintDisabled className="mx-auto text-2xl" />
      </button>
    </div>
  </div>
);
