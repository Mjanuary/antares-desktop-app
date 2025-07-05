import { AnimatePresence, motion } from "framer-motion";
import { FunctionComponent, ReactNode } from "react";

export const ModalContainer: FunctionComponent<{
  show: boolean;
  children: ReactNode;
  className?: string;
}> = ({ children, show, className }) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 bottom-0 flex items-center justify-center right-0 left-0 bg-gray-400/20 backdrop-blur-md z-[1111111] overflow-auto"
        >
          <div
            className={`w-[90%] max-w-screen-lg p-2 border border-color-theme rounded-lg bg-parent max-h-[90vh] ${className}`}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
