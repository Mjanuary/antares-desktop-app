import { FunctionComponent } from "react";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { dateFormat } from "../../utils";

export const DateNavigation: FunctionComponent<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}> = ({ onDateChange, selectedDate }) => {
  const handlePrev = () => {
    onDateChange(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - 1
      )
    );
  };

  const handleNext = () => {
    onDateChange(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + 1
      )
    );
  };

  return (
    <div className="flex items-center gap-2 border border-color-theme rounded-full px-1 py-0.5">
      <button
        className="text-xl bg-gray-100/30 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:bg-gray-100/10 p-1 rounded-full"
        type="button"
        onClick={handlePrev}
      >
        <MdSkipPrevious />
      </button>
      <h2 className="text-lg">{dateFormat(selectedDate)}</h2>
      <button
        className="text-2xl bg-gray-100/30 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:bg-gray-100/10 p-1 rounded-full"
        type="button"
        onClick={handleNext}
      >
        <MdSkipNext />
      </button>
    </div>
  );
};
