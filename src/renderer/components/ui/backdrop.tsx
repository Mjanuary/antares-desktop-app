import classNames from "classnames";
import { FunctionComponent } from "react";

export const Backdrop: FunctionComponent<{
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  hrefClose?: boolean;
}> = ({ onClick, disabled, className, hrefClose }) => {
  const onClickHandler = () => {
    if (disabled) return;

    if (onClick) {
      onClick?.();
      return;
    }

    // TODO: Add react router support here
    // if (hrefClose) {
    //   router.push(`?modal=false`, { scroll: false });
    //   return;
    // }
  };

  return (
    <div
      onClick={onClickHandler}
      className={classNames(
        "fixed dark:bg-gray-900/30 z-20 bg-green-900/20 top-0 right-0 left-0 bottom-0 backdrop-blur-sm",
        className
      )}
    />
  );
};
