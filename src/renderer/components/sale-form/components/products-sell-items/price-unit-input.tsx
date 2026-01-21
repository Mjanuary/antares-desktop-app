import { FunctionComponent, useState } from "react";
import { CurrencyEnum } from "../../../../../types/app.logic.types";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";

export const PriceUnitInput: FunctionComponent<{
  value: number;
  currency: CurrencyEnum;
  onUpdatePriceUnit: (value: number) => void;
  onClose: () => void;
  disabled?: boolean;
  applyTitle: string;
  cancelTitle: string;
  title: string;
}> = ({
  currency,
  onUpdatePriceUnit,
  value,
  onClose,
  disabled,
  applyTitle,
  cancelTitle,
  title,
}) => {
  const [priceUnit, setPriceUnit] = useState(value);

  return (
    <div className="flex flex-col relative">
      <span className="opacity-60 text-sm">{title}:</span>
      <div className="flex items-center text-left bg-gray-500 p-0.5 rounded-lg gap-1 pr-1">
        <Input
          className="w-[90px]"
          step={1}
          value={priceUnit}
          onChange={(e) => {
            setPriceUnit(+e.target.value);
          }}
          type="number"
          disabled={disabled}
        />

        <Badge variant="info">{currency}</Badge>
      </div>

      <div className="absolute top-16 left-0 w-[200px] rounded-xl border border-color-theme grid grid-cols-2 gap-2 right-0 p-2 backdrop-blur-md">
        <Button
          variant="primary"
          onClick={() => {
            onUpdatePriceUnit(priceUnit);
          }}
          disabled={disabled}
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

export const PriceUnitClickable: FunctionComponent<{
  onClick: () => void;
  value: number;
  currency: CurrencyEnum;
  disabled?: boolean;
  title: string;
}> = ({ currency, onClick, value, disabled, title }) => {
  return (
    <div className="flex flex-col relative">
      <span className="opacity-60 text-sm">{title}:</span>
      <div className="flex items-center bg-gray-500 p-0.5 rounded-lg gap-1 pr-1">
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-[90px] text-left rounded-md border shadow-sm transition-colors  disabled:cursor-not-allowed disabled:opacity-50 border-[#BDBDBD] dark:border-[#464646] dark:bg-[#202124] bg-[#fff] h-9 px-3 py-1 text-sm"
        >
          {value}
        </button>

        <Badge variant="info">{currency}</Badge>
      </div>
    </div>
  );
};
