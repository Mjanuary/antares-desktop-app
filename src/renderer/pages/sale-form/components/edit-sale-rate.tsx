import { FunctionComponent, useState } from "react";
import { MdLink } from "react-icons/md";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { numberReadFormat } from "../../../utils";
const linkedIcon = <MdLink className="text-lg text-blue-500" />;

export const EditSaleRate: FunctionComponent<{
  // title: string;
  showRate: boolean;
  disabled: boolean;
  rateRWF: number;
  setRateRWF: (value: number) => void;
  rateCDF: number;
  setRateCDF: (value: number) => void;
  defaultRateRWF?: boolean;
  defaultRateCDF?: boolean;
  errorRWF?: string;
  errorCDF?: string;
}> = ({
  disabled,
  showRate,
  rateRWF,
  setRateRWF,
  rateCDF,
  setRateCDF,
  defaultRateCDF,
  defaultRateRWF,
  errorCDF,
  errorRWF,
}) => {
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);
  // const t = useTranslations("sell-invitation");
  const t = (key: string) => key; // Dummy translation function
  if (!showRate) return null;
  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setOpen(true)}
        variant="secondary"
        title={t("rate")}
      >
        <span className="opacity-60">CDF:</span>
        {numberReadFormat(rateCDF)} | <span className="opacity-60">RWF:</span>
        {numberReadFormat(rateRWF)}
        {/* <Badge variant="info">
          {numberReadFormat(rateCDF)}
          {` (CDF)`}
        </Badge>

        <span> | </span>

        <Badge variant="info">
          {numberReadFormat(rateRWF)}
          {` (RWF)`}
        </Badge> */}
      </Button>
      {open && (
        <Modal title={t("rate")} onBackdropClose={onClose} onClose={onClose}>
          {showRate && (
            <div className="flex flex-col lg:flex-row lg:items-center flex-1 gap-2 pr-3 lg:border-r border-color-theme">
              <div className="flex-1 whitespace-nowrap py-2">
                <h4>{t("e-rate")}</h4>
                <p className="text-xs opacity-50">{t("b-rate")}</p>
              </div>

              <div className="flex  items-center gap-4">
                <div className="py-2">
                  <Input
                    type="number"
                    value={rateRWF}
                    onChange={(e) => setRateRWF(+e.target.value)}
                    label={
                      <span className="flex items-center gap-1">
                        {defaultRateRWF && linkedIcon}
                        <span>
                          {t("rate")} {`(RWF)`}
                        </span>
                      </span>
                    }
                    inputSize="sm"
                    className="w-[150px]"
                    error={errorRWF}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <Input
                    type="number"
                    value={rateCDF}
                    onChange={(e) => setRateCDF(+e.target.value)}
                    inputSize="sm"
                    label={
                      <span className="flex items-center gap-1">
                        {defaultRateCDF && linkedIcon}
                        <span>
                          {" "}
                          {t("rate")}
                          {` (CDF)`}
                        </span>
                      </span>
                    }
                    className="w-[150px]"
                    error={errorCDF}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};
