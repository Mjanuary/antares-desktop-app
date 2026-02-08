import classNames from "classnames";
import { FunctionComponent, useState } from "react";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { isValidNumber } from "../../../../utils/client-utils";

export const ClickableQuantity: FunctionComponent<{
  onClickInput: () => void;
  value: number;
  disabled?: boolean;
  title: string;
}> = ({ onClickInput, value, disabled, title }) => {
  return (
    <div className="flex flex-col relative">
      <span className="opacity-60 text-sm">{title}:</span>
      <div className="flex items-center bg-gray-500 p-0.5 rounded-lg gap-1">
        <button
          disabled={disabled}
          onClick={onClickInput}
          className="w-[90px] text-left rounded-md border shadow-sm transition-colors  disabled:cursor-not-allowed disabled:opacity-50 border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff] h-9 px-3 py-1 text-sm"
          value={value}
        >
          {value}
        </button>
      </div>
    </div>
  );
};

export const QuantityInput: FunctionComponent<{
  value: number;
  onQuantityUpdate: (quantity: number) => void;
  onClose: () => void;
  disabled?: boolean;
  title: string;
  applyTitle: string;
  cancelTitle: string;
}> = ({
  value: valueDefault,
  onClose,
  onQuantityUpdate,
  disabled,
  applyTitle,
  cancelTitle,
  title,
}) => {
  const [quantity, setQuantity] = useState<string>(valueDefault + "");
  const isValid = isValidNumber(quantity);

  return (
    <div className="flex flex-col relative">
      <span className="opacity-60 text-sm">{title}:</span>

      <div className="flex items-center bg-gray-500 p-0.5 rounded-lg gap-1">
        <Input
          className={classNames("w-[90px]", { "border-red-600": !isValid })}
          containerClassName={classNames({
            "border-red-600 border rounded-lg": !isValid,
          })}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="string"
          disabled={disabled}
        />
      </div>

      <div className="absolute top-16 min-w-[200px] left-0 rounded-xl border border-color-theme grid grid-cols-2 gap-2 right-0 p-2 backdrop-blur-md">
        <Button
          variant="primary"
          onClick={() => {
            if (isValid) onQuantityUpdate(+quantity);
          }}
          disabled={disabled || !isValid}
        >
          {applyTitle}
        </Button>
        <Button variant="destructive" onClick={onClose} disabled={disabled}>
          {cancelTitle}
        </Button>
      </div>
    </div>
  );
};
