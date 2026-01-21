import { FunctionComponent } from "react";
import { Button } from "./ui/button";
import classNames from "classnames";

export type TabType = {
  title: string;
  value: any;
};

export const Tabs: FunctionComponent<{
  tabs: TabType[];
  activeTab: any;
  setActiveTab: (tab: TabType) => void;
  disabled?: boolean;
  parentClassName?: string;
}> = ({ tabs, activeTab, setActiveTab, disabled, parentClassName }) => {
  return (
    <div
      className={classNames(
        "border-b pt-2 border-color-theme flex pl-2 gap-2",
        parentClassName
      )}
    >
      {tabs.map((tab: TabType) => (
        <Button
          key={tab.value}
          className={
            tab.value === activeTab
              ? "!rounded-b-none"
              : "!bg-transparent !rounded-b-none"
          }
          variant="secondary"
          onClick={() => setActiveTab(tab)}
          disabled={disabled}
        >
          {tab.title}
        </Button>
      ))}
    </div>
  );
};
