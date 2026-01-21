import { FormEvent, FunctionComponent, useState } from "react";
import { MdBarcodeReader } from "react-icons/md";
import { NoProductSelected } from "./no-product-selected";
import { ProductItem } from "./product-item";
import {
  CurrencyEnum,
  DiverSearchSellType,
} from "../../../../../types/app.logic.types";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { getNumber } from "../../../../utils";
import { currencyConversion } from "../../rate-convertion";
import { DiversSaleItemType_Details } from "../../sale.utils";
import { Button } from "../../../../components/ui/button";
import { focusInput } from "../../../../utils/client-utils";

const ProductSellItems: FunctionComponent<{
  saleId: string;
  selectedCurrency: CurrencyEnum;
  branchCurrency: CurrencyEnum;
  rateRWF: number;
  rateCDF: number;
  productsList: DiversSaleItemType_Details[];
  setProductsList: (products: DiversSaleItemType_Details[]) => void;
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
  const { branch } = useUserContext();
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [selectedCode, setSelectedCode] = useState<null | string>(null);
  const isLoading = false;
  // const { data: diverResults, isLoading } = useQuery({
  //   queryKey: ["diver-details", branch?.branch?.id, selectedCode],
  //   queryFn: () =>
  //     getDiverSaleScanSearch({
  //       branchId: branch?.branch?.id!,
  //       code: selectedCode!,
  //     }),
  //   enabled: !!selectedCode && !!branch?.branch?.id,
  //   refetchOnWindowFocus: false,
  // });

  // useEffect(() => {
  //   focusInput();
  // }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSelectedCode(input);
    focusInput();
  };

  // useEffect(() => {
  //   if (!!diverResults && !isLoading && !!selectedCode) {
  //     setSelectedCode(null);
  //     setInput("");
  //     focusInput();
  //     if (diverResults.length >= 1)
  //       addScannedProductToProductList(diverResults[0]);
  //   }

  //   if (
  //     !isLoading &&
  //     !!selectedCode &&
  //     (!diverResults || diverResults?.length <= 0)
  //   ) {
  //     toast.error("No products found");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [diverResults, isLoading, selectedCode]);

  const addScannedProductToProductList = (product: DiverSearchSellType) => {
    if (disabled) return;
    const found = productsList.find(
      (el) => el.product_id === product.product_id,
    );

    if (found) {
      setProductsList(
        productsList.map((item) => {
          if (item.product_id === found.product_id) {
            const newQuantity = item.quantity + 1;
            const priceTotal = item.price_unit * newQuantity;

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
              quantity: newQuantity,
              price_total: priceTotal,
              price_total_bc: totalBranch,
            };
          } else {
            return item;
          }
        }),
      );
    } else {
      const priceUnit = getNumber(
        selectedCurrency === CurrencyEnum.CDF
          ? product.price_CDF
          : selectedCurrency === CurrencyEnum.USD
            ? product.price_USD
            : product.price_RWF,
      );

      const newPriceTotal = priceUnit * 1;
      const totalBranch = currencyConversion(
        {
          CDF: rateCDF,
          RWF: rateRWF,
        },
        selectedCurrency,
        branchCurrency,
        newPriceTotal,
      );

      setProductsList([
        ...productsList,
        {
          ...product,
          bonus: 0,
          created_time: new Date(),
          designed: false,
          designed_by: "N/A",
          id: "uuidv4()",
          price_total: newPriceTotal,
          price_total_bc: totalBranch,
          price_unit: priceUnit,
          printed: false,
          product_id: product.product_id,
          product_to_branch_id: product.product_to_branch_id!,
          quantity: 1,
          recorded_by: session?.user.id!,
          sale_id: saleId,
          updated_time: new Date(),
          row_version: 1,
          app_connection: null,
          row_deleted: null,
        },
      ]);
    }
  };

  const onUpdateQuantity = (
    prod: DiversSaleItemType_Details,
    updatedQuantity: number,
  ) => {
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
    prod: DiversSaleItemType_Details,
    updatedPriceUnit: number,
  ) => {
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
    <div className=" border-l border-color-theme">
      {/* <div className="height-offset-top-navigation" /> */}

      <div className="p-4 backdrop-blur-lg border-b border-color-theme sticky top-[50px] z-10 flex items-center gap-3 ">
        <div>
          <h2 className="text-lg">{t("products")}</h2>
          <p className="m-0 text-xs -mt-1">
            {t("total-items")}:{" "}
            <Badge variant="info">{productsList.length}</Badge>
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex border flex-1 items-center border-color-theme p-1 rounded-lg gap-1"
        >
          <Input
            type="text"
            containerClassName="flex-1"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            disabled={isLoading || disabled}
            id="scan-input"
          />
          <Button variant="primary-light" disabled={isLoading || disabled}>
            <MdBarcodeReader className="text-2xl" />
          </Button>
        </form>
        <Button variant="secondary" size="lg" disabled={isLoading || disabled}>
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
            disabled={isLoading || disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSellItems;
function useUserContext(): { branch: any } {
  // throw new Error("Function not implemented.");
  return { branch: { branch: { id: "branch-id" } } };
}
function useAuth(): { session: any } {
  // throw new Error("Function not implemented.");
  return { session: { user: { id: "user-id" } } };
}
