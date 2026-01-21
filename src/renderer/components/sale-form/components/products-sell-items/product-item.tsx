import { FunctionComponent, useState } from "react";
import {
  MdPrint,
  MdDeleteOutline,
  MdOutlinePrintDisabled,
  MdAccountCircle,
} from "react-icons/md";
import { PiConfettiBold } from "react-icons/pi";
import { PriceUnitInput, PriceUnitClickable } from "./price-unit-input";
import { QuantityInput, ClickableQuantity } from "./quantity-input";
import {
  CurrencyEnum,
  DiversSaleItemType_Details,
} from "../../../../../types/app.logic.types";
import { Badge } from "../../../../components/ui/badge";
import { numberReadFormat } from "../../../../utils";
import { Button } from "../../../../components/ui/button";

export const ProductItem: FunctionComponent<{
  data: DiversSaleItemType_Details;
  selectedCurrency: CurrencyEnum;
  onUpdateQuantity: (
    data: DiversSaleItemType_Details,
    quantity: number,
  ) => void;
  onUpdatePriceUnit: (
    data: DiversSaleItemType_Details,
    quantity: number,
  ) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}> = ({
  data,
  selectedCurrency,
  onUpdateQuantity,
  onUpdatePriceUnit,
  onRemove,
  disabled,
}) => {
  // const t = useTranslations("sell-invitation");
  const t = (key: string) => key; // Dummy translation function
  const [quantityEdit, setQuantityEdit] = useState(false);
  const [priceUnitEdit, setPriceUnitEdit] = useState(false);

  const {
    bonus,
    price_total,
    printed,
    category_name,
    image_url,
    name,
    stock_quantity,
  } = data;

  return (
    <div className="p-2 rounded-2xl border border-color-theme flex gap-4 bg-color-overlay-theme">
      <div>
        {image_url ? (
          <img
            src={image_url}
            alt="Product cover"
            className="w-[130px] h-[130px] bg-gray-400 rounded-lg"
          />
        ) : (
          <div className="w-[130px] bg-gray-100 h-[130px] rounded-lg" />
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg pb-1">
          {category_name}: {name}
        </h2>

        <div className="flex flex-wrap lg:pr-4 justify-between ---grid-cols-4 gap-4 p whitespace-nowrap border-t border-color-theme pt-2 pb-2">
          {[
            {
              title: t("p-total"),
              value: `${numberReadFormat(price_total)}  ${selectedCurrency}`,
            },
            { title: t("stock"), value: numberReadFormat(stock_quantity) },
            // {
            //   title: "Location",
            //   value: "--",
            // },
          ].map((el) => (
            <div key={el.title} className="flex flex-col">
              <span className="text-sm opacity-60">{el.title}</span>
              <b>{el.value}</b>
            </div>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap justify-between-- border-t border-color-theme pt-2">
          {quantityEdit ? (
            <QuantityInput
              onClose={() => setQuantityEdit(false)}
              onQuantityUpdate={(value) => {
                onUpdateQuantity(data, value);
                setQuantityEdit(false);
              }}
              value={data.quantity}
              disabled={disabled}
              applyTitle={t("apply")}
              cancelTitle={t("cancel")}
              title={t("q")}
            />
          ) : (
            <ClickableQuantity
              value={data.quantity}
              onClickInput={() => setQuantityEdit(true)}
              disabled={disabled}
              title={t("q")}
            />
          )}

          {priceUnitEdit ? (
            <PriceUnitInput
              currency={selectedCurrency}
              onClose={() => setPriceUnitEdit(false)}
              onUpdatePriceUnit={(value) => {
                onUpdatePriceUnit(data, value);
                setPriceUnitEdit(false);
              }}
              value={data.price_unit}
              disabled={disabled}
              applyTitle={t("apply")}
              cancelTitle={t("cancel")}
              title={t("pu")}
            />
          ) : (
            <PriceUnitClickable
              currency={selectedCurrency}
              onClick={() => setPriceUnitEdit(true)}
              value={data.price_unit}
              disabled={disabled}
              title={t("pu")}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          variant="secondary"
          className="flex gap-2"
          disabled
          title={t("bonus")}
        >
          <PiConfettiBold className="text-xl" />
          {bonus >= 1 && <Badge variant="warning">{bonus}</Badge>}
        </Button>
        <Button
          variant={!printed ? "secondary" : "destructive"}
          disabled
          title={t("print")}
        >
          {printed ? (
            <MdPrint className="text-xl" />
          ) : (
            <MdOutlinePrintDisabled className="text-xl" />
          )}
        </Button>
        <Button variant="secondary" disabled title={t("designer")}>
          <MdAccountCircle className="text-xl" />
        </Button>
        <Button
          title={t("remove")}
          variant="destructive"
          onClick={() =>
            window.confirm(t("remove-warn")) ? onRemove(data.id) : {}
          }
          disabled={disabled}
        >
          <MdDeleteOutline className="text-xl" />
        </Button>
      </div>
    </div>
  );
};
