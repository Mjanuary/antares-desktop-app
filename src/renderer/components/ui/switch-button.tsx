import classNames from "classnames";
import { FunctionComponent } from "react";
import { MdToggleOn, MdToggleOff } from "react-icons/md";

export const SwitchButton: FunctionComponent<{
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  activeTitle?: string;
  disableTitle?: string;
  className?: string;
}> = ({ onChange, value, activeTitle, className, disableTitle, disabled }) => (
  <button
    type="button"
    className={classNames("text-6xl", className)}
    onClick={() => onChange(!value)}
    title={value ? activeTitle || "" : disableTitle || ""}
    disabled={disabled}
  >
    {value ? (
      <MdToggleOn className="text-green-200" />
    ) : (
      <MdToggleOff className="text-red-200" />
    )}
  </button>
);
