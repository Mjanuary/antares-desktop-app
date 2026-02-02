import { useState } from "react";
import { saleStore } from "../../../store/sale-store";
import classNames from "classnames";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/double-button";

const SaleFormsDisplay = () => {
  const { saleForms, focus, setFocus } = saleStore();

  return (
    <>
      {saleForms.length > 0 && !!focus && (
        <div
          className="fixed top-0 left-0 right-0 h-screen z-50 w-[52px]"
          style={{
            top: "0",
            left: "0",
            bottom: "0",
            width: "72px",
          }}
          onClick={() => {
            if (
              window.confirm("Are you sure you want to close all sale forms?")
            ) {
              setFocus(null);
            }
          }}
        />
      )}

      {saleForms.map((form) => {
        const isFocus = form.id === focus;
        return (
          <div
            className={classNames(
              "bg-black fixed top-0 left-0 right-0 h-screen z-50 overflow-y-auto",
              isFocus
                ? "top-0 left-0 right-0 h-screen z-50 overflow-y-auto"
                : "hidden overflow-hidden w-0 h-0",
            )}
            style={
              isFocus
                ? {
                    top: "52px",
                    left: "72px",
                    bottom: "0",
                  }
                : {}
            }
          >
            <p className="text-white">
              janvier contents here {form.name} - {form.id} - {form.position}
            </p>
            <SaleForm />
          </div>
        );
      })}
    </>
  );
};

export default SaleFormsDisplay;

const SaleForm = () => {
  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <h1>Sale Form</h1>

      <Input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />
      <Input
        placeholder="Client Phone"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
      />
      <Input
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <Input
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <Input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <Input
        placeholder="Total"
        value={total}
        onChange={(e) => setTotal(Number(e.target.value))}
      />

      <div className="flex gap-2">
        <Button
          onClick={() => {
            // setFocus(null);
          }}
          variant="destructive"
        >
          Close
        </Button>

        <Button
          onClick={() => {
            // setFocus(null);
          }}
          variant="primary"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
