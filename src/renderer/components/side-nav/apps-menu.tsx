import { FunctionComponent } from "react";
import { Input } from "../ui/input";
import { TbReport } from "react-icons/tb";

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
          {[1, 2, 3, 4, 5, 6, 7, 8, 11, 121, 3, 13].map((item) => (
            <button
              key={item}
              className="  m-2 flex items-center justify-center"
            >
              <div className=" text-white font-semibold flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-6 rounded-lg bg-white/10 text-4xl">
                    <TbReport />
                  </div>

                  <span>Report here</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppsMenu;
