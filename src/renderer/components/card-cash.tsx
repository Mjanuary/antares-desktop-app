import { FunctionComponent, ReactNode } from "react";

export const CardCash: FunctionComponent<{
  title: string;
  value: string | ReactNode;
  subValue?: ReactNode;
  borderColor?: boolean;
}> = ({ subValue, title, value, borderColor = false }) => (
  <div
    className={`${
      borderColor ? "border-x border-color-theme" : ""
    } flex-1 py-2 px-6 `}
  >
    <h6 className="text-base-color text-sm">{title}</h6>
    <h1 className="text-lg font-bold mb-0.5">{value}</h1>
    {subValue && <p className="m-0 text-base-color text-xs">{subValue}</p>}
  </div>
);
