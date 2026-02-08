import { FunctionComponent } from "react";
import { MdAdd } from "react-icons/md";
import { NoProductSelected } from "./no-product-selected";
import { ProductItem } from "./product-item";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { currencyConversion } from "../../../../components/sale-form/rate-convertion";
import { focusInput } from "../../../../utils/client-utils";
import {
  CurrencyEnum,
  ProductForm_SaleItemType_Details,
} from "../../../../../types/app.logic.types";

const ProductSellItems: FunctionComponent<{
  saleId: string;
  selectedCurrency: CurrencyEnum;
  branchCurrency: CurrencyEnum;
  rateRWF: number;
  rateCDF: number;
  productsList: ProductForm_SaleItemType_Details[];
  setProductsList: (products: ProductForm_SaleItemType_Details[]) => void;
  disabled?: boolean;
}> = ({
  saleId,
  selectedCurrency,
  branchCurrency,
  rateCDF,
  rateRWF,
  productsList,
  setProductsList,
  disabled,
}) => {
  // const t = useTranslations("sell-invitation");
  const t = (key: string) => key; // Dummy translation function

  const onUpdateQuantity = (
    prod: ProductForm_SaleItemType_Details,
    updatedQuantity: number,
  ) => {
    console.log("updatedQuantity", updatedQuantity);
    if (disabled) return;
    const found = productsList.find((el) => el.product_id === prod.product_id);

    if (found) {
      setProductsList(
        productsList.map((item) => {
          if (item.product_id === found.product_id) {
            const priceTotal = item.price_unit * updatedQuantity;

            const totalBranch = currencyConversion(
              {
                CDF: rateCDF,
                RWF: rateRWF,
              },
              selectedCurrency,
              branchCurrency,
              priceTotal,
            );

            return {
              ...item,
              quantity: updatedQuantity,
              price_total: priceTotal,
              price_total_bc: totalBranch,
            };
          } else {
            return item;
          }
        }),
      );
    }
  };

  const onUpdatePriceUnit = (
    prod: ProductForm_SaleItemType_Details,
    updatedPriceUnit: number,
  ) => {
    console.log("updatedPriceUnit", updatedPriceUnit);
    if (disabled) return;
    const found = productsList.find((el) => el.product_id === prod.product_id);

    if (found) {
      setProductsList(
        productsList.map((item) => {
          if (item.product_id === found.product_id) {
            const priceTotal = updatedPriceUnit * item.price_total;

            const totalBranch = currencyConversion(
              {
                CDF: rateCDF,
                RWF: rateRWF,
              },
              selectedCurrency,
              branchCurrency,
              priceTotal,
            );

            return {
              ...item,
              price_total: priceTotal,
              price_total_bc: totalBranch,
              price_unit: updatedPriceUnit,
            };
          } else {
            return item;
          }
        }),
      );
    }
  };

  const onRemoveProduct = (id: string) => {
    if (disabled) return;
    setProductsList(productsList.filter((el) => el.id !== id));
  };

  const onAddProduct = () => {};
  const onEnableScanner = () => focusInput();

  return (
    <div
      className=" border-l border-color-theme flex-1"
      style={{ maxWidth: "522px" }}
    >
      <div className="p-2 backdrop-blur-lg border-b border-color-theme sticky z-10 flex items-center gap-3 ">
        <div>
          <h2 className="text-lg">{t("products")}</h2>
          <p className="m-0 text-xs -mt-1">
            {t("total-items")}:{" "}
            <Badge variant="info">{productsList.length}</Badge>
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={<MdAdd />}>
          {t("add-product")}
        </Button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {productsList.length <= 0 && (
          <NoProductSelected
            onAddProduct={onAddProduct}
            onEnableScanner={onEnableScanner}
          />
        )}
        {productsList.map((product) => (
          <ProductItem
            data={product}
            key={product.product_id}
            selectedCurrency={selectedCurrency}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePriceUnit={onUpdatePriceUnit}
            onRemove={onRemoveProduct}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSellItems;
