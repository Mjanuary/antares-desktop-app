import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa6";
import { MdShoppingCart } from "react-icons/md";
import { Logo } from "../ui/Logo";
import { IoApps } from "react-icons/io5";
import { NavButton, NavButtonIcon } from "./nav-button";
import { FaBox, FaMoneyCheckAlt, FaSync } from "react-icons/fa";
import { RouterPages } from "../../../types/pages.types";
import { useSyncStore } from "../../../store/sync-store";
import { RiPassPendingFill } from "react-icons/ri";

const SideNavigation: FunctionComponent<{
  selected: string;
  onSelect: (value: string) => void;
  onAppsOpen: () => void;
}> = ({ selected, onAppsOpen }) => {
  const { running } = useSyncStore();
  const { t } = useTranslation();
  return (
    <div
      className="bg-overlay z-40 fixed top-0 left-0 bottom-0 flex flex-col justify-between text-white border-r border-gray-700"
      style={{
        width: "70px",
        backgroundColor: "#0c4824",
      }}
    >
      <div className="m-2 pl-2 rounded-md mb-2 w-fit text-center">
        <Logo className="w-16 h-16 " />
      </div>
      <div className="flex flex-col pt-2 gap-1 flex-1">
        {[
          {
            icon: <MdShoppingCart />,
            label: t("sidebar.sales"),
            nav: RouterPages.Sales,
          },
          {
            icon: <FaBox />,
            label: t("sidebar.products"),
            nav: RouterPages.Products,
          },
          {
            icon: <FaMoneyCheckAlt />,
            label: t("sidebar.balance"),
            nav: RouterPages.Balances,
          },
          {
            icon: <RiPassPendingFill />,
            label: t("sidebar.spending"),
            nav: RouterPages.Expenses,
          },
        ].map((item) => (
          <NavButton
            key={item.nav}
            icon={item.icon}
            label={item.label}
            isActive={selected === item.nav}
            pageUrl={item.nav as RouterPages}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <NavButtonIcon
          label={t("sidebar.profile")}
          icon={<FaUser />}
          isActive={selected === "profile"}
          pageUrl={RouterPages.Profile}
        />

        <NavButtonIcon
          icon={<FaSync className={running ? "animate-spin" : ""} />}
          label={t("sidebar.sync")}
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
