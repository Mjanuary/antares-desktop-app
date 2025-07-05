import classNames from "classnames";
import { FunctionComponent } from "react";
import { IconType } from "react-icons";
import { MdClose, MdAdd } from "react-icons/md";

type Option = {
  label: string;
  value: string;
};
interface MultiSelectProps {
  title: string;
  options: Option[];
  selected: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const SelectOption: FunctionComponent<{
  icon: IconType;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  label: string;
}> = ({ icon: Icon, onClick, disabled, selected, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={classNames(
      "flex  items-center gap-2 p-1 text-white  rounded-full px-2",
      {
        "bg-green-900": selected,
        "bg-gray-400 ": !selected,
      }
    )}
  >
    <label className="text-sm">{label}</label>
    <Icon />
  </button>
);

export const MultiSelect: FunctionComponent<MultiSelectProps> = ({
  onValueChange,
  disabled,
  selected,
  options,
  title,
  error,
}) => {
  const onAddOption = (optionValue: string) => {
    const optionExist = selected.includes(optionValue);
    if (optionExist) {
      const newSelected = selected.filter((itm) => itm !== optionValue);
      onValueChange(newSelected);
    } else {
      onValueChange([...selected, optionValue]);
    }
  };

  return (
    <div>
      <label className="block mb-1 capitalize text-base-color text-sm">
        {title}
      </label>
      <div className="dark:bg-gray-600 dark:border-gray-400 border !border-b-transparent  px-2 pt-2 pb-2 rounded-t-lg ">
        {selected.length >= 1 && (
          <label className="text-xs pb-2 block m-0 dark:opacity-30 opacity-80">
            Selected:
          </label>
        )}
        <div className={classNames(" flex gap-2 flex-wrap", {})}>
          {selected.length <= 0 && (
            <p className="flex-1 text-center opacity-40 py-2">
              No {title} selected
            </p>
          )}
          {selected.map((selectedValue) => {
            const selectedItm = options.find(
              (itm) => itm.value === selectedValue
            );
            if (!selectedItm) return null;

            return (
              <SelectOption
                icon={MdClose}
                key={selectedItm.value}
                onClick={() => onAddOption(selectedItm.value)}
                label={selectedItm.label}
                disabled={disabled}
                selected
              />
            );
          })}
        </div>
      </div>

      <div className="dark:bg-black p-2 flex gap-2 flex-wrap bg-gray-100 rounded-b-lg dark:border-gray-400 border !border-t-transparent">
        {options.map(({ label, value }) => {
          const isSelected = selected.includes(value);
          if (isSelected) return null;

          return (
            <SelectOption
              icon={MdAdd}
              onClick={() => onAddOption(value)}
              key={value}
              label={label}
              disabled={disabled}
            />
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
