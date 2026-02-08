import { Button } from "../../../components/double-button";
import {
  CurrencyEnum,
  ProductListType,
} from "../../../../types/app.logic.types";
import { FunctionComponent, ReactNode, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { saleStore } from "../../../../store/sale-store";
import { authStore } from "../../../../store/auth";

const SellProductButton: FunctionComponent<{
  children: ReactNode;
  product: ProductListType;
  variant:
    | "outline"
    | "primary"
    | "default"
    | "primary-light"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  size: "sm" | "lg" | "default" | "icon" | "icon-sm-rounded" | null | undefined;
}> = ({ children, product, variant, size }) => {
  const { saleForms, focus, addProductToSaleForm } = saleStore();
  const { branch } = authStore();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductListType | null>(null);
  return (
    <>
      {selectedProduct && (
        <Modal title="Choose type" onClose={() => setSelectedProduct(null)}>
          <div className="flex flex-col gap-2">
            {saleForms.length <= 0 ? (
              <>
                <Button
                  onClick={() => {
                    addProductToSaleForm({
                      saleId: null,
                      product: selectedProduct,
                      branchCurrency:
                        (branch?.branch_currency as CurrencyEnum) ||
                        CurrencyEnum.USD,
                    });
                    setSelectedProduct(null);
                  }}
                  variant="primary"
                >
                  Add to: New sale
                </Button>
              </>
            ) : (
              <>
                {saleForms.map((saleForm) => (
                  <Button
                    key={saleForm.id}
                    onClick={() => {
                      addProductToSaleForm({
                        saleId: saleForm.id,
                        product: selectedProduct,
                        branchCurrency:
                          (branch?.branch_currency as CurrencyEnum) ||
                          CurrencyEnum.USD,
                      });
                      setSelectedProduct(null);
                    }}
                    variant="primary"
                  >
                    Add to: {saleForm.name}
                  </Button>
                ))}

                <Button
                  onClick={() => {
                    addProductToSaleForm({
                      saleId: null,
                      product: selectedProduct,
                      branchCurrency:
                        (branch?.branch_currency as CurrencyEnum) ||
                        CurrencyEnum.USD,
                    });
                    setSelectedProduct(null);
                  }}
                  variant="primary"
                >
                  Add to: New sale
                </Button>
              </>
            )}

            {/* <Button
              onClick={() => {
                addProductToSaleForm(focus, selectedProduct);
                setSelectedProduct(null);
              }}
              variant="primary"
            >
              Add to sale
            </Button>

            <Button
              onClick={() => {
                addProductToSaleForm(focus, selectedProduct);
                setSelectedProduct(null);
              }}
              variant="primary"
            >
              Add to sale
            </Button> */}
          </div>
        </Modal>
      )}

      <Button
        onClick={() => {
          if (saleForms.length >= 1) {
            setSelectedProduct(product);
          } else {
            addProductToSaleForm({
              saleId: focus,
              product,
              branchCurrency:
                (branch?.branch_currency as CurrencyEnum) || CurrencyEnum.USD,
            });
          }
        }}
        variant={variant}
        size={size}
      >
        {children} {selectedProduct?.name}
      </Button>
    </>
  );
};

export default SellProductButton;
