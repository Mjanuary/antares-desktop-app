import React, { FunctionComponent } from "react";
import { IconType } from "react-icons";

interface InfoSectionProps {
  icon?: IconType;
  title: string;
  children: React.ReactNode;
  sideContent?: React.ReactNode;
}

export const InfoSection: FunctionComponent<InfoSectionProps> = ({
  icon: Icon,
  title,
  children,
  sideContent,
}) => {
  return (
    <div className="border border-color-theme mb-4 rounded p-2 gap-2 flex items-center">
      <div className="px-2 opacity-50">
        {Icon && <Icon className="text-4xl" />}
      </div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <div>{children}</div>
      </div>
      {sideContent}
    </div>
  );
};
