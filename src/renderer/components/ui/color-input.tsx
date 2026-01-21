import { FunctionComponent, useMemo, useState } from "react";
import classNames from "classnames";
import { MdAdd, MdCheckCircle, MdClose } from "react-icons/md";
import { Button } from "./button";
import { Input } from "./input";
import { searchArray } from "../../../renderer/utils/client-utils";
import { Modal } from "./modal";
import { Color, COLORS } from "../../../main/constants";

export interface PaperSize {
  width: number;
  height: number;
}

export const ColorInput: FunctionComponent<{
  title: string;
  colors: string[];
  updateColors: (s: string[]) => void;
  error?: string;
  className?: string;
  isDisabled?: boolean;
  renderButton?: boolean;
  closeOnSelect?: boolean;
}> = ({
  title,
  colors,
  updateColors,
  error,
  className,
  isDisabled,
  renderButton = false,
  closeOnSelect,
}) => {
  //   const t = useTranslations("colors-input");
  const t = (key: string) => key; // Placeholder for translation function

  const [modalOpen, setModalOpen] = useState(false);

  const onColorSelectHandler = (color: string) => {
    const colorExists = colors.includes(color);

    if (colorExists) {
      if (window.confirm(t("warn")))
        updateColors(colors.filter((c) => c !== color));
    } else {
      updateColors([...colors, color]);
    }
    if (closeOnSelect) setModalOpen(false);
  };
  return (
    <>
      {renderButton ? (
        <Button
          variant="primary-light"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          {t("add")}
        </Button>
      ) : (
        <div className={classNames("flex-1", className)}>
          <div className="flex items-center pb-2">
            <div className="flex-1 flex justify-between">
              <h4 className="text-md flex-1">{title}</h4>

              <Button
                size="default"
                variant="primary-light"
                className="!px-2 h-6 !py-0.5 rounded"
                onClick={() => setModalOpen(true)}
                disabled={isDisabled}
              >
                <MdAdd className="text-lg" />
              </Button>
            </div>
          </div>
          <div
            className={classNames(
              "border  bg-gray-100/10 dark:bg-gray-700 content-start p-2 min-h-[148px] rounded  overflow-auto max-h-[200px] flex gap-2 ",
              {
                "flex-wrap": colors.length >= 1,
                "items-center justify-center": colors.length <= 0,
                "border-red-500": error,
                "border-gray-100 dark:border-gray-500": !error,
              },
            )}
          >
            {colors.length <= 0 && (
              <div className="text-center">
                <h6 className="pb-1 opacity-60">{title}</h6>
                <Button
                  variant="primary-light"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                >
                  {t("add")}
                </Button>
              </div>
            )}

            {colors.map((color) => {
              const foundColor = COLORS.find((c) => c.keyword === color);
              if (!foundColor) return null;
              return (
                <ColorItem
                  onClick={() => onColorSelectHandler(foundColor.keyword)}
                  icon={<MdClose />}
                  key={foundColor.english}
                  color={foundColor}
                  disabled={isDisabled}
                  // lang={lang}
                  lang="fr"
                />
              );
            })}
          </div>
          {error && <p className="m-0 text-xs text-red-500">{error}</p>}
        </div>
      )}

      {modalOpen && (
        <AddColorModal
          selectedColors={colors}
          onClick={onColorSelectHandler}
          onClose={() => setModalOpen(false)}
          title={title}
        />
      )}
    </>
  );
};

//
const AddColorModal: FunctionComponent<{
  onClose: () => void;
  selectedColors: string[];
  onClick: (color: string) => void;
  title: string;
}> = ({ onClose, selectedColors, onClick, title }) => {
  const t = (key: string) => key; // Placeholder for translation function
  const [search, setSearch] = useState("");

  const results = useMemo(
    () =>
      searchArray(COLORS, search, {
        keyword: true,
      }),
    [search],
  );

  // const lang = getUserLanguage();

  return (
    <Modal size="sm" noSpacing>
      <div className="flex h-[400px] flex-col w-[400px]">
        <div className="p-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg pb-2 px-2- pt-1 font-bold">{title}</h2>

            <Button
              onClick={() => onClose()}
              className="!p-1 rounded-full h-fit"
              variant="outline"
              size="sm"
            >
              <MdClose className="text-lg" />
            </Button>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder={t("search")}
          />
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-2 gap-1 pt-3">
            {results.map((color) => {
              const exists = selectedColors.includes(color.keyword);
              return (
                <ColorItem
                  className="w-full"
                  key={color.english}
                  color={color}
                  // lang={lang}
                  lang="fr"
                  icon={
                    exists ? (
                      <MdCheckCircle className="text-xl" />
                    ) : (
                      <MdAdd className="text-xl" />
                    )
                  }
                  onClick={() => onClick(color.keyword)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const getColorByKeyword = (color: string) => {
  const foundColor = COLORS.find((c) => c.keyword === color);
  if (!foundColor) return null;
  return foundColor;
};

export const ColorItem: FunctionComponent<{
  color: Color;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  noControls?: boolean;
  disabled?: boolean;
  lang?: "en" | "fr";
  size?: "sm" | "lg";
}> = ({
  color,
  className,
  icon,
  onClick,
  noControls,
  disabled,
  lang = "en",
  size = "lg",
}) => (
  <button
    onClick={onClick}
    className={classNames(
      "flex w-fit bg-white dark:bg-gray-500/50 border hover:bg-gray-100 dark:hover:bg-gray-500 dark:border-gray-500 h-fit text-left items-center gap-1 rounded-full p-1",
      className,
    )}
    disabled={disabled}
  >
    <div
      className={classNames(" rounded-full", {
        "p-2": size === "sm",
        "p-3": size === "lg",
      })}
      style={{ backgroundColor: color.colorCode }}
    />
    <span
      className={classNames("flex-1 whitespace-nowrap pr-1", {
        "text-xs": size === "sm",
        "text-sm ": size === "lg",
      })}
    >
      {lang === "en" ? color.english : color.french}
    </span>
    {!noControls && icon && (
      <div className="p-1 bg-gray-100/40 dark:text-gray-100 text-gray-300 dark:bg-gray-500 hover:bg-gray-400 rounded-full ml-1">
        {icon}
      </div>
    )}
  </button>
);
