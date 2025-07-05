import React, { FunctionComponent } from "react";
import { Button, ButtonProps } from "./button";

interface Props {
  buttons: (ButtonProps & { name: string })[];
  active?: string;
  className?: string;
  label?: string;
}

const ButtonGroup: FunctionComponent<Props> = ({
  buttons,
  active,
  className,
  label,
}) => {
  return (
    <div>
      {label && <label className="text-base-color">{label}</label>}
      <div
        className={`flex bg-color-overlay-theme border border-color-theme p-1 rounded-xl ${className}`}
      >
        {buttons.map((button, key) => (
          <Button
            className={`${
              active === button.value
                ? "font-bold border border-white"
                : "bg-transparent !border-none"
            }  ${button.className} flex-1`}
            key={key}
            variant={active === button.value ? "primary-light" : "ghost"}
            {...button}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

export default ButtonGroup;
