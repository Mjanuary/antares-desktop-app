// import AppLink from "@/components/Link";
// import { Button } from "@/components/ui/button";
// import { Modal } from "@/components/ui/modal";
// import { useTranslations } from "next-intl";
import React, { FunctionComponent } from "react";
import { MdCheck, MdPrint } from "react-icons/md";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";

export const SaleSuccessModal: FunctionComponent<{
  onClearForm: () => void;
  onPrintReceipt: () => void;
}> = ({ onClearForm, onPrintReceipt }) => {
  // const t = useTranslations("sell-invitation");
  const t = (key: string) => key; // Dummy translation function
  return (
    <Modal>
      <div className="flex flex-col text-center gap-3 py-8">
        <div className="w-28 mx-auto h-28 bg-green-800/20 text-green-300 flex items-center justify-center rounded-full text-8xl">
          <MdCheck />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl">{t("success-message")}</h3>
          <p className="opacity-70">{t("success-message-sub")}</p>
        </div>
        <div className="flex gap-2 mx-auto w-fit">
          {/* <AppLink href="/dashboard"> */}
          <Button variant="secondary">{t("dashboard")}</Button>
          {/* </AppLink> */}
          {/* <AppLink href="/diver-sales"> */}
          <Button variant="primary-light" onClick={onClearForm}>
            {t("open-sales")}
          </Button>
          {/* </AppLink> */}
          <Button variant="primary" icon={<MdPrint />} onClick={onPrintReceipt}>
            {t("print-receipt")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
