import { FunctionComponent, useState } from "react";
import {
  MdArrowBack,
  MdBarcodeReader,
  MdShoppingBasket,
  MdOutlineOpenInFull,
  MdShoppingCart,
} from "react-icons/md";
import classNames from "classnames";
import { Button } from "../ui/button";

const AppTopBar: FunctionComponent<{
  onBack?: () => void;
  title?: string;
  tabs?: {
    title: string;
    onClick: () => void;
    subTitle: string;
    active: boolean;
  }[];
  onSubmitSearch?: (query: string) => void;
  onSaleClick?: () => void;
}> = ({ onBack, title, tabs, onSubmitSearch, onSaleClick }) => {
  const [search, setSearch] = useState("");
  return (
    <div className="bg-overlay pl-16 border-b justify-between sticky top-0 z-30 border-gray-700 flex items-center h-[50px]">
      <div className="flex items-center gap-2 pr-3 pl-2">
        <div className="py-2 pl-2">
          <Button size="icon-sm-rounded" variant="secondary" onClick={onBack}>
            <>
              <MdArrowBack className="text-lg" />
            </>
          </Button>
        </div>
        <div>
          <h2 className="text-lg">{title}</h2>
        </div>
      </div>

      {onSubmitSearch && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitSearch?.(search);
          }}
          className="bg-gray-700/40 border-x border-gray-700 flex-1 max-w-[400px] h-[50px] relative flex"
        >
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-2">
            <MdBarcodeReader className="text-3xl" />
          </div>
          <input
            type="search"
            className="flex-1 bg-transparent px-2 pl-12 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-global-scan"
          />
        </form>
      )}

      <div className="flex border-l border-gray-700">
        {tabs &&
          tabs.map((item, index) => (
            <button
              key={index}
              className={classNames(
                "p-2 border-r px-3 border-gray-700 text-left flex items-center gap-2 hover:bg-gray-700",
                {
                  "bg-primary-100/10 !border-b-2 !border-b-primary-100":
                    item.active,
                },
              )}
              onClick={item.onClick}
            >
              <div className="bg-gray-600 p-1 rounded">
                <MdShoppingBasket className="text-2xl" />
              </div>

              <div className="pr-1">
                <h3 className="text-sm">{item.title}</h3>
                <p className="text-xs m-0 -mt-0.5 opacity-50">
                  {item.subTitle}
                </p>
              </div>

              <MdOutlineOpenInFull className="text-gray-500" />
            </button>
          ))}
        <button
          onClick={onSaleClick}
          className="bg-primary-400 hover:bg-primary-200 px-4 gap-1 flex items-center"
        >
          <MdShoppingCart className="text-3xl" /> <span>Sell</span>
        </button>
      </div>
    </div>
  );
};

export default AppTopBar;
