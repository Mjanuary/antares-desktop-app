import { FunctionComponent, useState } from "react";
import { MdAdd, MdDelete, MdInfo } from "react-icons/md";
import { toast } from "sonner";
import classNames from "classnames";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table";
import { Modal } from "../components/ui/modal";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PaperSizeType } from "../../types/app.logic.types";

export const PaperSize: FunctionComponent<{
  title: string;
  sizes: PaperSizeType[];
  updatePaperSize: (s: PaperSizeType[]) => void;
  error?: string;
  className?: string;
  isDisabled?: boolean;
}> = ({
  title,
  sizes,
  updatePaperSize,
  error,
  className,
  isDisabled = false,
}) => {
  //   const t = useTranslations("paper-sizes");
  const t = (key: string) => key; // Placeholder for translation function
  const [openModal, setOpenModal] = useState(false);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const onRemovePaperSize = (s: PaperSizeType) => {
    if (!window.confirm(t("rem-msg"))) return;

    const newSizes = sizes.filter(
      (s2) => s2.width !== s.width || s2.height !== s.height,
    );
    updatePaperSize(newSizes);
  };

  const onAddSizesHandler = () => {
    // check if the sizes are already created
    if (width === 0 || height === 0) {
      toast.error(t("req-msg"));
      return;
    }

    const exists = sizes.some((s) => s.width === width && s.height === height);
    if (exists) {
      toast.info(t("exst-msg"));
      return;
    }

    const newSizes = [...sizes, { width, height }];
    updatePaperSize(newSizes);
    setWidth(0);
    setHeight(0);
    setOpenModal(false);
  };

  return (
    <>
      <div className={classNames("flex-1", className)}>
        <div className="flex items-center pb-2">
          <div className="flex-1">
            <h4 className="text-md flex-1">{title}</h4>
          </div>
        </div>

        <div
          className={classNames("border  rounded", {
            "border-red-500": error,
            "border-gray-100 dark:border-gray-500": !error,
          })}
        >
          <Table className="rounded overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="h-9">
                  {t("w")}
                  {"("}cm{")"}
                </TableHead>
                <TableHead className="h-6">
                  {t("h")}
                  {"("}cm{")"}
                </TableHead>
                <TableHead className="w-fit h-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((size, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-300 hover:bg-opacity-5"
                >
                  <TableCell className="font-medium">{size.width}cm</TableCell>
                  <TableCell className="font-medium">{size.height}cm</TableCell>
                  <TableCell className="text-right pr-3 p-1 w-fit">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="px-3 py-0.5"
                      onClick={() => onRemovePaperSize(size)}
                      disabled={isDisabled}
                    >
                      <MdDelete />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {sizes.length <= 0 && (
                <TableRow className="hover:bg-gray-300 hover:bg-opacity-5">
                  <TableCell className="font-medium " colSpan={8}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👇</span>

                      <div className="flex-1">
                        <span className="opacity-60 font-light">
                          {t("msg")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              <TableRow className="hover:bg-gray-300  hover:bg-opacity-5">
                <TableCell colSpan={5} className="text-center p-1">
                  <Button
                    variant="primary"
                    size="icon"
                    onClick={() => setOpenModal(true)}
                  >
                    <MdAdd className="text-xl" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {error && <p className="m-0 text-xs text-red-500">{error}</p>}
      </div>

      {openModal && (
        <Modal title="Add size" size="sm" onClose={() => setOpenModal(false)}>
          <div className="flex flex-col gap-2">
            {error && <p className="m-0 text-xs text-red-500">{error}</p>}

            <Input
              label={`${t("w")} (cm)`}
              className="w-full"
              inputSize="sm"
              value={width}
              placeholder={t("w")}
              onChange={(e) => setWidth(+e.target.value)}
              type="number"
              disabled={isDisabled}
            />

            <Input
              label={`${t("h")} (cm)`}
              className="w-full"
              inputSize="sm"
              value={height}
              type="number"
              placeholder={t("h")}
              onChange={(e) => setHeight(+e.target.value)}
              disabled={isDisabled}
            />

            <Button
              variant="primary"
              className="w-full"
              onClick={onAddSizesHandler}
              disabled={width === 0 || height === 0 || isDisabled}
            >
              <MdAdd className="text-xl" />
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export const ProductPaperList: FunctionComponent<{
  sizes: PaperSizeType[];
}> = ({ sizes }) => {
  //   const t = useTranslations("paper-sizes");
  const t = (key: string) => key; // Placeholder for translation function

  return (
    <Table className="rounded overflow-hidden">
      <TableHeader>
        <TableRow>
          <TableHead className="w-2">#</TableHead>
          <TableHead className="">
            {t("w")}
            {"("}cm{")"}
          </TableHead>
          <TableHead className="h-2">
            {t("h")}
            {"("}cm{")"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sizes.map((size, index) => (
          <TableRow
            key={index}
            className="hover:bg-gray-300 hover:bg-opacity-5"
          >
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{size.width}cm</TableCell>
            <TableCell className="font-medium">{size.height}cm</TableCell>
          </TableRow>
        ))}

        {sizes.length <= 0 && (
          <TableRow className="hover:bg-gray-300 hover:bg-opacity-5">
            <TableCell className="font-medium " colSpan={8}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  <MdInfo />
                </span>

                <div className="flex-1">
                  <span className="opacity-60 font-light">{t("no-msg")}</span>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
