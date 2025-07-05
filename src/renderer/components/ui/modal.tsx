import { FunctionComponent } from "react";
// import Link from "next/link";
import { Backdrop } from "./backdrop";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";
import classNames from "classnames";
import { Button } from "./button";
import { MdClose } from "react-icons/md";
const buttonVariants = cva(
  "fixed border border-color-theme bg-parent top-0 z-50  h-fit max-h-[100vh] overflow-auto right-0 left-0 bottom-0 m-auto rounded-lg",
  {
    variants: {
      size: {
        default: "max-w-screen-md",
        sm: "w-fit",
        lg: "max-w-screen-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface ModalProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  title?: string;
  noSpacing?: boolean;
  modalCloseHref?: boolean;
  onBackdropClose?: () => void;
  onClose?: () => void;
  disableClose?: boolean;
  headerSpacing?: boolean;
}

export const Modal: FunctionComponent<ModalProps> = ({
  children,
  title,
  size,
  noSpacing = false,
  modalCloseHref,
  onBackdropClose,
  onClose,
  disableClose,
  headerSpacing,
}) => {
  // TODO: add the router link here
  return (
    <>
      {modalCloseHref && !disableClose ? (
        // <Link href={{ query: { modal: "false" } }} legacyBehavior>
        <Backdrop />
      ) : (
        // </Link>
        <Backdrop disabled={disableClose} onClick={onBackdropClose} />
      )}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        key="new-form"
        className={cn(buttonVariants({ size }))}
        // className={classNames(
        //   "fixed border border-white/20 bg-black top-0 z-50  h-fit max-h-[100vh] overflow-auto right-0 left-0 bottom-0 m-auto rounded-lg",
        //   {
        //     "max-w-screen-md": !sm,
        //     "w-fit": sm,
        //   }
        // )}
      >
        <div
          className={classNames({
            "p-4 px-6": !noSpacing,
          })}
        >
          {title && (
            <div
              className={classNames(
                "flex items-center pb-5 font-bold content-between",
                {
                  "p-4": headerSpacing,
                }
              )}
            >
              <h2 className="flex-1 text-xl">{title}</h2>
              {onClose && (
                <Button
                  variant="secondary"
                  size="icon-sm-rounded"
                  onClick={onClose}
                  type="button"
                  disabled={disableClose}
                >
                  <MdClose className="text-xl" />
                </Button>
              )}
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </>
  );
};
