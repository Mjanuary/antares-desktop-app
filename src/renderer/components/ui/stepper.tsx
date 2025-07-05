import classNames from "classnames";
import { motion } from "framer-motion";
import { FunctionComponent, ReactNode } from "react";
import { MdCheck } from "react-icons/md";

export type StepperType = {
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  id?: number;
  title: ReactNode | string;
  contents: ReactNode;
};

interface SteppeProps {
  onStepChange: (step: number) => void;
  steps: StepperType[];
  activeStep: number;
}

export const Stepper: FunctionComponent<SteppeProps> = ({
  activeStep,
  onStepChange,
  steps,
}) => {
  return (
    <div className="container  relative">
      <div className="border-l-2 border-color-theme z-0 h-full w-0 absolute top-0  bottom-0 ml-3" />
      <div className="z-10 relative">
        {steps.map((step, index) => {
          const currentStep = index + 1;
          const isCurrentStep = currentStep === activeStep;

          return (
            <div key={index} className="pb-3">
              <div className="flex items-center gap-4 pb-2">
                <button
                  type="button"
                  className={classNames(
                    "w-6 h-6 text-sm rounded-full flex items-center text-center justify-center outline-4 outline outline-[#fefefe] dark:outline-[#141414]",
                    {
                      "bg-color-overlay-theme ": !isCurrentStep,
                      "bg-black/80 dark:bg-white text-white dark:text-black ":
                        isCurrentStep,
                      "dark:!bg-green-200 !bg-green-600 dark:text-black text-white":
                        step.success,
                      "dark:!bg-red-200 !bg-red-600 dark:text-black text-white":
                        step.error,
                    }
                  )}
                  onClick={() => onStepChange(currentStep)}
                >
                  {step.success ? (
                    <MdCheck className="text-md" />
                  ) : (
                    <span className="text-xs">{currentStep}</span>
                  )}
                </button>

                <button type="button" onClick={() => onStepChange(currentStep)}>
                  <h2
                    className={classNames("font-semibold ", {
                      "dark:text-green-200 text-green-600": step.success,
                      "dark:text-red-200 text-red-600": step.error,
                      "text-color-overlay-theme": step.disabled,
                    })}
                  >
                    {step.title}
                  </h2>
                </button>
              </div>
              <motion.div
                animate={{
                  height: isCurrentStep ? "auto" : "0px",
                }}
                className="pl-10 overflow-hidden h-0"
              >
                {step.contents}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
