import { RouterPages } from "@/types/pages.types";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";

export const NavButton: FunctionComponent<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  pageUrl?: RouterPages;
}> = ({ icon, label, isActive, onClick, pageUrl }) => {
  if (pageUrl)
    return (
      <NavLink to={`/${pageUrl}`}>
        <button
          className={classNames(
            "flex items-center py-2 flex-col gap-0.5 justify-center hover:bg-[#3A3C44] cursor-pointer outline-none",
            {
              "bg-[#3A3C44]": isActive,
            }
          )}
          title={label}
          style={{ outline: "none" }}
        >
          <div
            className="text-2xl w-11 h-11 flex items-center justify-center  bg-black rounded-2xl"
            style={{ width: "2.75rem", height: "2.75rem" }}
          >
            {icon}
          </div>
          <span className="text-xs">{label}</span>
        </button>
      </NavLink>
    );

  return (
    <button
      onClick={onClick}
      className={classNames(
        "flex items-center py-2 flex-col gap-0.5 justify-center hover:bg-[#3A3C44] cursor-pointer outline-none",
        {
          "bg-[#3A3C44]": isActive,
        }
      )}
      title={label}
      style={{ outline: "none" }}
    >
      <div
        className="text-2xl w-11 h-11 flex items-center justify-center  bg-black rounded-2xl"
        style={{ width: "2.75rem", height: "2.75rem" }}
      >
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export const NavButtonIcon: FunctionComponent<{
  icon?: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  profileUrl?: string;
  pageUrl: RouterPages;
}> = ({ profileUrl, icon, label, isActive, onClick, pageUrl }) => {
  return (
    <NavLink to={`/${pageUrl}`} className="block w-fit mx-auto">
      <button
        className={"flex items-center flex-col gap-0.5 justify-center "}
        title={label}
        onClick={onClick}
        style={{ outline: "none" }}
      >
        <div
          className={classNames(
            "text-xl w-8 h-8 rounded-full overflow-hidden flex items-center justify-center  bg-black border-2 border-solid-- border-transparent hover:border-gray-500",
            {
              "border border-gray-400": isActive,
            }
          )}
        >
          {profileUrl && (
            <img
              src={profileUrl}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          )}
          {icon && icon}
        </div>
      </button>
    </NavLink>
  );
};
