import classNames from "classnames";
import { FunctionComponent } from "react";
import { MdWarning, MdCheckCircle, MdInfo } from "react-icons/md";

export const Alert: FunctionComponent<{
  type: "error" | "warning" | "info" | "success" | "default";
  children: React.ReactNode;
}> = ({ type, children }) => (
  <div
    className={classNames("flex items-center rounded-lg gap-2 p-2", {
      "bg-gray-200/20 text-white": type === "default",
      "bg-red-500/20 text-red-300": type === "error",
      "bg-blue-500/20 text-blue-300": type === "info",
      "bg-green-500/20 text-green-300": type === "success",
      "bg-yellow-500/20 text-yellow-300": type === "warning",
    })}
  >
    <div className="text-2xl">
      {type === "error" && <MdWarning />}
      {type === "success" && <MdCheckCircle />}
      {type === "info" && <MdInfo />}
      {type === "warning" && <MdWarning />}
      {type === "default" && <MdInfo />}
    </div>

    <div>{children}</div>
  </div>
);
