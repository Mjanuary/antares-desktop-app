import { FunctionComponent } from "react";
import { Button } from "./ui/button";
import { MdArrowBack, MdClose } from "react-icons/md";

export const TopNavigation: FunctionComponent<{
  title: string;
  subTitle?: string;
  onClose?: () => void;
  onBack?: () => void;
  children?: React.ReactNode;
}> = ({ title, subTitle, onClose, onBack, children }) => (
  <div className="flex lg:flex-row flex-col lg:items-center lg:justify-between border-b border-color-theme p-2 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm sticky top-12 pt-2 z-10">
    <div className="flex gap-2 items-center">
      {/* <FaReceipt className="text-3xl" /> */}
      {onBack && (
        <Button onClick={onBack} size="icon-sm-rounded" variant="secondary">
          <MdArrowBack className="text-lg" />
        </Button>
      )}

      <div className="flex flex-col">
        <h2 className="text-lg">{title}</h2>
        {subTitle && (
          <span className="text-xs -mt-1 text-primary-200">{subTitle}</span>
        )}
      </div>
    </div>

    <div className="flex gap-2 pt-3 lg:pt-0 mx-auto lg:mx-0 w-fit">
      {children}

      {onClose && (
        <Button variant="destructive" size="icon" onClick={onClose}>
          <MdClose className="text-2xl" />
        </Button>
      )}
    </div>
  </div>
);
