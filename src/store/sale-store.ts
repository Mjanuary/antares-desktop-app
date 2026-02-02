import { create } from "zustand";

interface SaleItem {
  id: string;
  name: string;
  position: "minimized" | "maximized";
  products: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface SaleStoreType {
  saleForms: SaleItem[];
  focus: string | null;
  addSaleForm: (saleForm: SaleItem) => void;
  removeSaleForm: (id: string) => void;
  setFocus: (id: string | null) => void;
}

export const saleStore = create<SaleStoreType>((set) => ({
  saleForms: [
    {
      id: "1",
      name: "Sale 1",
      position: "maximized",
      products: [],
    },
    {
      id: "2",
      name: "Sale 2",
      position: "minimized",
      products: [],
    },
    {
      id: "3",
      name: "Sale 3",
      position: "minimized",
      products: [],
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
}));
