import { FunctionComponent } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { Logo } from "../ui/Logo";
import { IoApps } from "react-icons/io5";
import { NavButton, NavButtonIcon } from "./nav-button";
import { FaSync } from "react-icons/fa";
import { RouterPages } from "../../../types/pages.types";

const SideNavigation: FunctionComponent<{
  selected: string;
  onSelect: (value: string) => void;
  onAppsOpen: () => void;
}> = ({ selected, onSelect, onAppsOpen }) => {
  return (
    <div
      className="bg-overlay fixed top-0 left-0 bottom-0 flex flex-col justify-between text-white "
      style={{
        width: "70px",
      }}
    >
      <div className="m-2 pl-2 rounded-md mb-2 w-fit text-center">
        <Logo className="w-16 h-16 " />
      </div>
      <div className="flex flex-col pt-2 gap-1 flex-1">
        {[
          {
            icon: <FaCartShopping />,
            label: "Invitation",
            nav: "invitation",
          },
          {
            icon: <FaCartShopping />,
            label: "Divers",
            nav: "divers",
          },
        ].map((item, index) => (
          <NavButton
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={selected === item.nav}
            onClick={() => onSelect(item.nav)}
          />
        ))}
        <div className="h-0.5 rounded-full mx-3 bg-gray-500" />

        {[
          {
            icon: <MdAccountBalanceWallet />,
            label: "Balance",
            nav: "balance",
          },
          {
            icon: <FaCartShopping />,
            label: "Spending",
            nav: "spending",
          },
        ].map((item, index) => (
          <NavButton
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={selected === item.nav}
            onClick={() => onSelect(item.nav)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <NavButtonIcon
          label="Sync"
          profileUrl="https://avatar.iran.liara.run/public"
          isActive={selected === "profile"}
          pageUrl={RouterPages.Profile}
        />

        <NavButtonIcon
          icon={<FaSync />}
          label="Sync"
          isActive={selected === "sync"}
          pageUrl={RouterPages.BackupSync}
        />

        <button
          className="p-3 text-4xl text-center hover:bg-gray-500/20 border-t border-gray-700 transition-colors duration-200"
          onClick={onAppsOpen}
        >
          <IoApps className="inline" />
        </button>
      </div>
    </div>
  );
};

export default SideNavigation;
