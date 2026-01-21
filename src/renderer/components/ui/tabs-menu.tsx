import classNames from "classnames";
import { FunctionComponent, ReactNode } from "react";

export const TabsMenu: FunctionComponent<{
  items: { title: string; key: string; icon?: ReactNode }[];
  active: string | null;
  onSelect: (value: string) => void;
}> = ({ items, onSelect, active }) => (
  <div className="flex gap-2 border border-color-theme- border-primary-200/40 bg-primary-300/10 p-1 rounded-2xl w-fit mx-auto">
    {items.map((el) => (
      <button
        onClick={() => onSelect(el.key)}
        key={el.key}
        className={classNames(
          "flex items-center hover:bg-primary-200/20 py-1.5 rounded-xl gap-2 px-4 pl-2 flex-col w-fit lg:flex-row",
          {
            "bg-primary-200/30 text-primary-400 dark:text-primary-100 ":
              active === el.key,
            "opacity-60 hover:opacity-100": active !== el.key,
          }
        )}
      >
        <span className="text-lg">{el.icon}</span>

        <span className="text-sm">{el.title}</span>
      </button>
    ))}
  </div>
);
