import {
  CurrencyEnum,
  ProductForm_SaleItemType_Details,
  ProductListType,
} from "../types/app.logic.types";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface SaleItem {
  id: string;
  name: string;
  productsList: ProductForm_SaleItemType_Details[];
  currency: CurrencyEnum;
}

interface SaleStoreType {
  saleForms: SaleItem[];
  focus: string | null;
  addSaleForm: (saleForm: SaleItem) => void;
  removeSaleForm: (id: string) => void;
  setFocus: (id: string | null) => void;
  setProductsList: (
    id: string,
    productsList: ProductForm_SaleItemType_Details[],
  ) => void;
  getSaleForm: (id: string) => SaleItem | undefined;
  addProductToSaleForm: (data: {
    saleId: string | null;
    product: ProductListType;
    openForm?: boolean;
    branchCurrency: CurrencyEnum;
  }) => void;
  closeSaleForm: (id: string) => void;
}

export const saleStore = create<SaleStoreType>((set, get) => ({
  saleForms: [],
  focus: null,
  addSaleForm: (saleForm) =>
    set((state) => ({
      saleForms: [...state.saleForms, saleForm],
    })),
  removeSaleForm: (id) =>
    set((state) => ({
      saleForms: state.saleForms.filter((saleForm) => saleForm.id !== id),
    })),
  setFocus: (id) => set((state) => ({ focus: id })),
  setProductsList: (id, productsList) => {
    set((state) => ({
      saleForms: state.saleForms.map((saleForm) =>
        saleForm.id === id ? { ...saleForm, productsList } : saleForm,
      ),
    }));
  },
  getSaleForm: (id) => {
    return get().saleForms.find((saleForm) => saleForm.id === id);
  },
  closeSaleForm: (id) => {
    set((state) => ({
      saleForms: state.saleForms.filter((saleForm) => saleForm.id !== id),
    }));
  },
  addProductToSaleForm: ({
    saleId,
    product,
    openForm = false,
    branchCurrency,
  }) => {
    set((state) => {
      // create new
      if (!saleId) {
        const newSaleId = uuidv4();
        return {
          focus:
            state.focus === null ? (openForm ? newSaleId : null) : state.focus,
          saleForms: [
            ...state.saleForms,
            {
              id: newSaleId,
              name: "S00-" + (state.saleForms.length + 1),
              currency: branchCurrency,
              productsList: [
                mappingProduct({
                  product,
                  saleId: newSaleId,
                  currency: branchCurrency,
                }),
              ],
            },
          ],
        };
      }

      // existing sale
      return {
        focus: state.focus === null ? (openForm ? saleId : null) : state.focus,
        saleForms: state.saleForms.map((saleForm) => {
          const productExist = saleForm.productsList.find(
            (el) => el.product_id === product.product_id,
          );
          let newProductsList = [];

          if (productExist) {
            newProductsList = saleForm.productsList.map((prod) =>
              prod.product_id === product.product_id
                ? { ...prod, quantity: prod.quantity + 1 }
                : prod,
            );
          } else {
            newProductsList = [
              ...saleForm.productsList,

              mappingProduct({
                product,
                saleId,
                currency: saleForm.currency,
              }),
            ];
          }

          return saleForm.id === saleId
            ? { ...saleForm, productsList: newProductsList }
            : saleForm;
        }),
      };
    });
  },
}));

const mappingProduct = ({
  product,
  saleId,
  currency,
}: {
  product: ProductListType;
  saleId: string;
  currency: CurrencyEnum;
}): ProductForm_SaleItemType_Details => {
  return {
    id: uuidv4(),
    code: product.code,
    product_id: product.product_id,
    product_to_branch_id: product.branch_product_id!,
    image_url: product.local_image_filename,
    name: product.name,

    price_CDF: String(product?.price_CDF || 0),
    price_RWF: String(product?.price_RWF || 0),
    price_USD: String(product?.price_USD || 0),

    price_total: Number(0),
    price_total_bc: Number(0),
    price_unit:
      currency === CurrencyEnum.CDF
        ? Number(product.price_CDF)
        : currency === CurrencyEnum.USD
          ? Number(product.price_USD)
          : Number(product.price_RWF),
    stock_quantity: product.stock_quantity,
    bonus: 0,
    designed: true,
    printed: true,
    quantity: 1,
    sale_id: saleId,
    designed_by: undefined,
  };
};
