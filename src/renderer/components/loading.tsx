import classNames from "classnames";
import { FunctionComponent } from "react";
import { CgSpinnerAlt } from "react-icons/cg";
import { cn } from "../utils/cn";

export const LoadingPage: FunctionComponent<{ fullPage?: boolean }> = ({
  fullPage = false,
}) => {
  return (
    <div
      className={classNames("h-[100vh] flex items-center justify-center", {
        "fixed top-0 bottom-0 right-0 h-[100vh] left-0": fullPage,
      })}
    >
      <Spinner />
    </div>
  );
};

export const Spinner: FunctionComponent<{
  className?: string;
  spinnerClassName?: string;
}> = ({ className, spinnerClassName }) => (
  <div className={classNames("w-fit", className)}>
    <CgSpinnerAlt
      className={cn(classNames("text-4xl animate-spin", spinnerClassName))}
    />
  </div>
);
