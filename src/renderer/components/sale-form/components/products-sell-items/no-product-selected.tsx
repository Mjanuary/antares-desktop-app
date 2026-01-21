// import { Button } from "@/components/ui/button";
// import { useTranslations } from "next-intl";
import { FunctionComponent } from "react";
import { MdOutlineShoppingBag } from "react-icons/md";
import { Button } from "../../../../components/ui/button";

export const NoProductSelected: FunctionComponent<{
  onAddProduct: () => void;
  onEnableScanner: () => void;
}> = ({ onAddProduct, onEnableScanner }) => {
  // const t = useTranslations("sell-invitation");
  const t = (key: string) => key; // Dummy translation function

  return (
    <div className="py-8 text-center flex flex-col items-center gap-4">
      <MdOutlineShoppingBag className="text-8xl mx-auto" />
      <div>
        <h2 className="text-xl">{t("no-product-sel")}</h2>
        <p className="opacity-60">{t("no-product-sel-desc")}</p>
      </div>

      <div className="flex gap-2 mx-auto">
        <Button variant="primary" onClick={onAddProduct}>
          {t("add-product")}
        </Button>
        <Button variant="secondary" onClick={onEnableScanner}>
          {t("enable-scanner")}
        </Button>
      </div>
    </div>
  );
};
