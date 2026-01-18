import { FunctionComponent } from "react";
import { Input } from "../ui/input";
import { NavLink } from "react-router-dom";
import { MdOutlineStore, MdOutlinePointOfSale } from "react-icons/md";
import { RouterPages } from "../../../types/pages.types";

const menuApps = [
  {
    icon: <MdOutlineStore />,
    label: "Houses",
    nav: RouterPages.Houses,
  },
  {
    icon: <MdOutlineStore />, // Maybe find a better icon?
    label: "Products",
    nav: RouterPages.Products,
  },
  {
    icon: <MdOutlinePointOfSale />,
    label: "Sales",
    nav: RouterPages.Sales,
  },
  {
    icon: <MdOutlinePointOfSale />,
    label: "Clients",
    nav: RouterPages.Clients,
  },
  {
    icon: <MdOutlinePointOfSale />,
    label: "Balances",
    nav: "balances",
  },
  {
    icon: <MdOutlinePointOfSale />,
    label: "Expenses",
    nav: "expenses",
  },
];

const AppsMenu: FunctionComponent<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <>
      <div
        className="fixed top-0 bottom-0 right-2 left-[70px] z-[11111] backdrop-blur-sm bg-gray-900/10"
        onClick={onClose}
      />
      <div className="fixed max-w-[500px] h-[70vh] bottom-4 left-[80px] border border-white/30 rounded-lg z-[1111111] flex bg-overlay backdrop-blur-lg flex-col">
        <div className="flex items-center justify-between px-4 border-b gap-2 py-2 border-b-white/10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Apps Menu</h2>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <Input />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3  pb-8 gap-8">
          {menuApps.map(({ icon, label, nav }, index) => (
            <NavLink
              to={`/${nav}`}
              className="w-full flex items-center justify-center hover:bg-[#3A3C44] h-fit"
              onClick={onClose}
            >
              <button
                key={index}
                className="  m-2 flex items-center justify-center"
              >
                <div className=" text-white font-semibold flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-6 rounded-lg bg-white/10 text-4xl">
                      {icon}
                    </div>

                    <span>{label}</span>
                  </div>
                </div>
              </button>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppsMenu;
