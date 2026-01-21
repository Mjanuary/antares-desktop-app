import { FunctionComponent, ReactNode } from "react";
import { CurrencyEnum } from "../../../../types/app.logic.types";

export const PayedInputWrapper: FunctionComponent<{
  children: ReactNode;
  title: string;
  value: string;
  currency: CurrencyEnum;
}> = ({ children, title, value, currency }) => (
  <div className="">
    <div className="border border-color-theme rounded-lg px-3 py-2 bg-[#F9F9F9] dark:bg-[#32353E]">
      <h4 className="text-xl font-bold">
        {value} <span className="text-xs font-light">{currency}</span>
      </h4>
      <p className="m-0 opacity-40 text-xs">{title}</p>
    </div>

    <div className="border-r-2 border-dashed w-[80%] border-color-theme mb-[-22px] h-10 pr-2" />

    {children}
  </div>
);
