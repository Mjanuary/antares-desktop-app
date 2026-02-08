import { DiversSaleItemType_Details } from "@/types/app.logic.types";
import { create } from "zustand";

interface SaleItem {
  id: string;
  name: string;
  productsList: DiversSaleItemType_Details[];
}

interface SaleStoreType {
  saleForms: SaleItem[];
  focus: string | null;
  addSaleForm: (saleForm: SaleItem) => void;
  removeSaleForm: (id: string) => void;
  setFocus: (id: string | null) => void;
  setProductsList: (
    id: string,
    productsList: DiversSaleItemType_Details[],
  ) => void;
  getSaleForm: (id: string) => SaleItem | undefined;
}

export const saleStore = create<SaleStoreType>((set, get) => ({
  saleForms: [
    {
      id: "1",
      name: "Sale 1",
      productsList: [],
    },
    {
      id: "2",
      name: "Sale 2",
      productsList: [],
    },
    {
      id: "3",
      name: "Sale 3",
      productsList: [
        {
          bonus: 0,
          category_name: "Janvier category",
          code: "12312",
          colors: [],
          created_time: new Date(),
          designed: true,
          id: "0870808",
          image_url: "",
          name: "",
          price_CDF: "",
          price_RWF: "",
          price_total: 12,
          price_total_bc: 12,
          price_unit: 12,
          price_USD: "12",
          printed: true,
          product_id: "23423423",
          product_to_branch_id: "1231231",
          quantity: 123,
          recorded_by: "123123",
          row_version: 1,
          sale_id: "12312",
          stock_quantity: 1233,
          sub_category_name: "12312",
          updated_time: new Date(),
          app_connection: "1",
          designed_by: "123",
          row_deleted: null,
          sync_status: "sd",
        },
        {
          bonus: 0,
          category_name: "category",
          code: "12312",
          colors: ["red", "blue", "green"],
          created_time: new Date(),
          designed: true,
          id: "123123",
          image_url: "",
          name: "Product name",
          price_CDF: "",
          price_RWF: "",
          price_total: 12,
          price_total_bc: 12,
          price_unit: 12,
          price_USD: "12",
          printed: true,
          product_id: "23423423",
          product_to_branch_id: "1231231",
          quantity: 123,
          recorded_by: "123123",
          row_version: 1,
          sale_id: "12312",
          stock_quantity: 1233,
          sub_category_name: "12312",
          updated_time: new Date(),
          app_connection: "1",
          designed_by: "123",
          row_deleted: null,
          sync_status: "sd",
        },
      ],
    },
  ],
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
}));
