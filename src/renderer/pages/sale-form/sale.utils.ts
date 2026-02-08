import { currencyConversion } from "../../components/sale-form/rate-convertion";
import {
  DiversSaleItemType,
  DiverSearchSellType,
  CurrencyEnum,
  ProductForm_SaleItemType_Details,
} from "../../../types/app.logic.types";

export type DiversSaleItemType_Details = DiversSaleItemType &
  DiverSearchSellType;

const calculatePriceTotal = (
  products: ProductForm_SaleItemType_Details[],
): { priceTotal: number; totalProducts: number } => {
  let priceTotal = 0;
  let totalProducts = 0;
  for (const product of products) {
    priceTotal = priceTotal + product.price_unit * product.quantity;
    totalProducts = totalProducts + product.quantity;
  }
  return { priceTotal, totalProducts };
};

export const calculateSalesData = ({
  selectedCurrency,
  branchCurrency,
  rateRWF,
  rateCDF,
  productsList,
  payedDol,
  payedFc,
  payedFrw,
}: {
  selectedCurrency: CurrencyEnum;
  branchCurrency: CurrencyEnum;
  rateCDF: number;
  rateRWF: number;
  productsList: ProductForm_SaleItemType_Details[];
  payedFrw: number;
  payedDol: number;
  payedFc: number;
}): {
  price_total_branch_currency: number;
  balance_CDF: number;
  balance_USD: number;
  balance_RWF: number;
  balance_branch_currency: number;
  totalPayed_branch_currency: number;
  totalPayed_PaymentType: number;
  balance_selected_currency: number;
  price_total_in_selected_currency: number;
  total_products: number;
} => {
  const { priceTotal: price_total_in_selected_currency, totalProducts } =
    calculatePriceTotal(productsList);

  const price_total_branch_currency =
    selectedCurrency === null || !branchCurrency
      ? 0
      : selectedCurrency !== branchCurrency
        ? currencyConversion(
            {
              RWF: rateRWF,
              CDF: rateCDF,
            },
            selectedCurrency,
            branchCurrency as CurrencyEnum,
            price_total_in_selected_currency,
          )
        : price_total_in_selected_currency;

  const payedRWF_in_selected_currency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.RWF,
    selectedCurrency!,
    payedFrw,
  );

  const payedUSD_in_selected_currency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.USD,
    selectedCurrency,
    payedDol,
  );

  const payedCDF_in_selected_currency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.CDF,
    selectedCurrency,
    payedFc,
  );

  const totalPayed_PaymentType =
    payedUSD_in_selected_currency +
    payedRWF_in_selected_currency +
    payedCDF_in_selected_currency;

  const totalPayed_branch_currency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    selectedCurrency as CurrencyEnum,
    branchCurrency as CurrencyEnum,
    totalPayed_PaymentType,
  );

  const balance_selected_currency =
    price_total_in_selected_currency - totalPayed_PaymentType;
  const balance_branch_currency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    selectedCurrency as CurrencyEnum,
    branchCurrency as CurrencyEnum,
    balance_selected_currency,
  );

  const balance_RWF = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    selectedCurrency as CurrencyEnum,
    CurrencyEnum.RWF,
    balance_selected_currency,
  );
  const balance_USD = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    selectedCurrency as CurrencyEnum,
    CurrencyEnum.USD,
    balance_selected_currency,
  );
  const balance_CDF = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    selectedCurrency as CurrencyEnum,
    CurrencyEnum.CDF,
    balance_selected_currency,
  );

  return {
    total_products: totalProducts,
    price_total_branch_currency,
    balance_CDF,
    balance_USD,
    balance_RWF,
    balance_branch_currency,
    totalPayed_branch_currency,
    totalPayed_PaymentType,
    balance_selected_currency,
    price_total_in_selected_currency,
  };
};
