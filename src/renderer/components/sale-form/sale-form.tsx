import { useMemo, useState } from "react";
import {
  CurrencyEnum,
  DiverSale__ValidationSchema,
  DiverSaleItem__ValidationSchema,
  DiversSaleItemType_Details,
  DiversSalesType,
  FormError,
  POSITIVE_VALUE_REGEX,
  Balance__ValidationSchema,
  BalanceProductType,
  BalanceStatusEnum,
  BalanceType,
} from "../../../types/app.logic.types";

import { dateFormat, getNumber } from "../../utils";
import { currencyConversion } from "./rate-convertion";
import { toast } from "sonner";
import z from "zod";
import { SelectInput } from "../../components/select-input";
import classNames from "classnames";
import { motion } from "framer-motion";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdWarning } from "react-icons/md";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { SaleSuccessModal } from "./components/sale-success-modal";
import { EditSaleComment } from "./components/edit-sale-comment";
import { EditSaleTransactionDate } from "./components/edit-sale-date";
import { EditSaleRate } from "./components/edit-sale-rate";
import ProductSellItems from "./components/products-sell-items/products-sell-items";
import { CardCash } from "../../components/card-cash";
import { PayedInputWrapper } from "./components/payed-input-wrapper";
import { HouseDropDown } from "../../components/db-dropdown/house-dropdown";
import { calculateSalesData } from "./sale.utils";

interface MyComponentProps {
  params: {
    id: string;
  };
  searchParams: {
    parent?: string; // Add this to interface
  };
}

export default function SaleForm({ params, searchParams }: MyComponentProps) {
  const saleId = "useMemo(() => uuidv4(), [])";
  const userId = "userId-from-context-or-auth";

  const t = (key: string) => key;
  const [productsList, setProductsList] = useState<
    DiversSaleItemType_Details[]
  >([]);

  const [clientName, setClientName] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    dateFormat(new Date()),
  );

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEnum | null>(
    "RFW" as CurrencyEnum,
  );

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [payedDol, setPayedDol] = useState<number>(0);
  const [payedFc, setPayedFc] = useState<number>(0);
  const [payedFrw, setPayedFrw] = useState<number>(0);

  const [comment, setComment] = useState<string>("");
  const [balancePayDate, setBalancePayDate] = useState("");
  const [balanceContacts, setBalanceContacts] = useState("");
  const [ignoreBalance, setIgnoreBalance] = useState<boolean>(false);
  const [rateRWF, setRateRWF] = useState<number>(0);
  const [rateCDF, setRateCDF] = useState<number>(0);
  const [sellHouse, setSellHouse] = useState("");
  const [errors, setErrors] = useState<FormError[]>([]);

  // others
  const [saleSuccess, setSaleSuccess] = useState<boolean>(false);
  const [printReceipt, setPrintReceipt] = useState<string | null>(null);

  console.log({ params, searchParams, sellHouse });

  // const showRate = !!branch?.branch?.show_rate_on_all_forms;
  const showRate = false;

  // const { mutate: createSaleServer, isPending } = useMutation({
  //   mutationFn: recordDiverSale,
  //   onSuccess: () => {
  //     toast.success("sale recorded successfully");
  //     setSaleSuccess(true);
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to create diver");
  //   },
  // });

  // useEffect(() => {
  //   setSelectedCurrency(branch?.branch?.branch_currency as CurrencyEnum);
  //   const rate = branch?.branch?.rate_in as BranchRate;

  //   // Rates
  //   if (rate) {
  //     setRateRWF(rate[CurrencyEnum.RWF] || 0);
  //     setRateCDF(rate[CurrencyEnum.CDF] || 0);
  //   }
  // }, [branch]);

  const onSelectHouseChange = (house_id: string) => {
    setSellHouse(house_id);
  };

  const supportedPayments = ["USD", "RWF", "CDF"];
  // const supportedPayments = branch?.branch?.supported_currency?.split(
  //   ","
  // ) as CurrencyEnum[];

  // const branchCurrency = branch?.branch?.branch_currency as CurrencyEnum;
  const branchCurrency = CurrencyEnum.RWF as CurrencyEnum;

  const recalculateSelectedProducts = ({
    currency,
    rate_CDF,
    rate_RWF,
  }: {
    currency?: CurrencyEnum;
    rate_CDF?: number;
    rate_RWF?: number;
  }) => {
    if (!selectedCurrency) return;
    const newCurrency = currency || selectedCurrency;
    const newRateCDF = rate_CDF || rateCDF;
    const newRateRWF = rate_RWF || rateRWF;

    setProductsList(
      productsList.map((product) => {
        const priceUnit = getNumber(
          newCurrency === CurrencyEnum.CDF
            ? product.price_CDF
            : newCurrency === CurrencyEnum.USD
              ? product.price_USD
              : product.price_RWF,
        );

        const priceTotal = priceUnit * product.quantity;
        const totalBranch = currencyConversion(
          {
            CDF: newRateCDF,
            RWF: newRateRWF,
          },
          newCurrency!,
          branchCurrency,
          priceTotal,
        );

        return {
          ...product,
          price_unit: priceUnit,
          price_total: priceTotal,
          price_total_bc: totalBranch,
        };
      }),
    );
  };

  const salesCalculations = useMemo(
    () =>
      calculateSalesData({
        branchCurrency,
        payedDol,
        payedFc,
        payedFrw,
        productsList,
        rateCDF,
        rateRWF,
        selectedCurrency: selectedCurrency || branchCurrency,
      }),
    [
      branchCurrency,
      payedDol,
      payedFc,
      payedFrw,
      productsList,
      rateCDF,
      rateRWF,
      selectedCurrency,
    ],
  );

  const {
    balance_CDF,
    balance_RWF,
    balance_USD,
    balance_branch_currency,
    price_total_branch_currency,
    totalPayed_branch_currency,
    totalPayed_PaymentType,
    balance_selected_currency,
    price_total_in_selected_currency,
    total_products,
  } = salesCalculations;

  // submit form
  const onSubmitData = () => {
    setErrors([]);
    const errors: FormError[] = [];

    // validation
    if (productsList.length <= 0)
      errors.push({ target: "products", message: t("req") });
    if (productsList.find((el) => el.price_unit <= 0 || el.quantity <= 0))
      errors.push({ target: "products", message: t("quantity-pu-required") });

    // other validations
    if (!clientName) errors.push({ target: "client_name", message: t("req") });
    if (!selectedCurrency)
      errors.push({ target: "payment_currency", message: t("req") });
    if (rateRWF <= 0) errors.push({ target: "rate_RWF", message: t("req") });
    if (rateCDF <= 0) errors.push({ target: "rate_CDF", message: t("req") });

    if (payedDol < 0) errors.push({ target: "payed_USD", message: t("req") });
    if (payedFrw < 0) errors.push({ target: "payed_RWF", message: t("req") });
    if (payedFc < 0) errors.push({ target: "payed_CDF", message: t("req") });
    if (payedDol === 0 && payedFrw === 0 && payedFc === 0)
      errors.push({ target: "main", message: t("err-pyd") });

    if (!transactionDate)
      errors.push({ target: "transaction_date", message: t("req") });

    if (!ignoreBalance) {
      if (balance_selected_currency > 0 && !balancePayDate)
        errors.push({ target: "balance_pay_date", message: t("req") });

      if (balance_selected_currency > 0 && !balanceContacts)
        errors.push({
          target: "balance_contacts",
          message: t("err-cont"),
        });
    }

    if (errors.length > 0) {
      setErrors(errors);
      return;
    }

    // validate with zod
    const diverSaleData: DiversSalesType = {
      id: saleId,
      // branch_id: branch?.branch?.id || null,
      branch_id: null,
      transaction_date: new Date(transactionDate),
      client_name: clientName,
      client_phone: null,
      total_products: total_products,
      house_id: sellHouse === "N/A" || sellHouse === "" ? null : sellHouse,
      payment_currency: selectedCurrency!,
      branch_currency: branchCurrency,
      price_total: price_total_in_selected_currency,
      price_total_bc: price_total_branch_currency,
      rate_RWF: rateRWF,
      rate_CDF: rateCDF,
      payed_USD: payedDol,
      payed_CDF: payedFc,
      payed_RWF: payedFrw,
      total_payed_cash: totalPayed_PaymentType,
      total_payed_cash_bc: totalPayed_branch_currency,
      balance: balance_selected_currency,
      balance_bc: balance_branch_currency,
      comment: comment,
      recorded_by: "b32e91e4-edfe-4581-aceb-381ccd624e30",
      // recorded_by: userId!,
      created_time: new Date(),
      updated_time: new Date(),
      receipt_id: null,
      client_id: selectedClientId || undefined,
      row_version: 1,
      app_connection: null,
      row_deleted: null,
    };

    const balanceData: BalanceType = {
      id: saleId,
      balance_parent_id: saleId,
      client_name: clientName,
      product_type: BalanceProductType.DIVERS,
      product_id: null,
      payment_currency: selectedCurrency!,
      branch_currency: branchCurrency,
      rate_RWF: rateRWF,
      rate_CDF: rateCDF,
      amount: balance_selected_currency,
      amount_bc: balance_branch_currency,
      sale_id: saleId,
      parent_sale_id: saleId,
      recorded_date: new Date(transactionDate),
      pay_date: new Date(balancePayDate),
      // branch_id: branch?.branch?.id!,
      branch_id: "branch?.branch?.id",
      house_id: sellHouse !== "N/A" ? sellHouse : null,
      active: true,
      balance_status: BalanceStatusEnum.WAITING,
      created_date: new Date(),
      updated_date: new Date(),
      payed_amount: 0,
      payed_amount_bc: 0,
      balance_contacts: balanceContacts,
      comment: "",
      recorded_by: userId || "",
      row_version: 1,
      app_connection: null,
      row_deleted: null,
    };

    const updatesSalesItems = productsList.map((el) => ({
      ...el,
      sale_id: saleId,
    }));

    // validate
    const validationDiver =
      DiverSale__ValidationSchema.safeParse(diverSaleData);
    if (!validationDiver.success) {
      toast.success(validationDiver.error.issues[0].message);
      console.log({ validationDiver: validationDiver.error });
      return;
    }

    // validate items-product
    const validationDiverItems = z
      .array(DiverSaleItem__ValidationSchema)
      .safeParse(updatesSalesItems);
    if (!validationDiverItems.success) {
      toast.success(validationDiverItems.error.issues[0].message);
      console.log({ validationDiverItems: validationDiverItems.error });

      return;
    }

    if (!ignoreBalance && balance_selected_currency > 0) {
      const validationBalance =
        Balance__ValidationSchema.safeParse(balanceData);
      if (!validationBalance.success) {
        toast.success(validationBalance.error.issues[0].message);
        return;
      }
    }

    // if (window.confirm(t("sale-confirm")))
    //   createSaleServer({
    //     saleData: diverSaleData,
    //     balanceData:
    //       ignoreBalance || balance_branch_currency <= 0 ? null : balanceData,
    //     productItems: updatesSalesItems,
    //   });
    console.log("Submitting data", {
      saleData: diverSaleData,
      balanceData:
        ignoreBalance || balance_branch_currency <= 0 ? null : balanceData,
      productItems: updatesSalesItems,
    });
  };

  const clearForm = () => {};

  const getInputError = (
    err:
      | keyof DiversSalesType
      | "payment_currency"
      | "balance_pay_date"
      | "main"
      | "balance_contacts",
  ): string | undefined => {
    const error = errors.find((e) => e.target === err);
    if (error) return error.message;
  };

  // if (status === "loading") return <LoadingPage />;
  // if (!haveAccess) return <NoAccessPage />;

  const mainError = getInputError("main");
  const createSalePending = true || saleSuccess;

  return (
    <>
      {saleSuccess && !printReceipt && (
        <SaleSuccessModal
          onClearForm={clearForm}
          onPrintReceipt={() => setPrintReceipt(saleId)}
        />
      )}

      {/* {printReceipt && (
        <Modal>
          <PrintReceiptContainer
            receiptId={saleId}
            onClose={() => setPrintReceipt(null)}
          />
        </Modal>
      )} */}

      <div className="min-h-[100vh] grid grid-cols-2 lg:flex-row flex-col">
        <div className="">
          {/* <div className="height-offset-top-navigation" /> */}

          <div className="pt-3 px-6 font-thin">
            <h2 className="text-2xl">{t("title-product")}</h2>
          </div>
          <div className="px-6">
            {mainError && (
              <div className="bg-red-500/40 text-red-200 mt-2 text-sm rounded-lg p-2">
                {mainError}
              </div>
            )}
          </div>
          <div className="px-6 pt-4 grid lg:grid-cols-3 gap-x-6 gap-y-3 pb-3">
            {/* <ClientCreateSelector
              clientName={clientName}
              setClientName={(value) => setClientName(value)}
              label={
                <span className="flex items-center gap-1">{t("c-name")}</span>
              }
              error={getInputError("client_name")}
              disabled={createSalePending}
              clientId={selectedClientId}
              setClientId={setSelectedClientId}
            /> */}

            <div className="">
              <HouseDropDown
                onChange={onSelectHouseChange}
                value={sellHouse}
                error={getInputError("house_id")}
                disabled={createSalePending}
                label={
                  <span className="flex items-center gap-1">
                    {t("s-house")}
                  </span>
                }
              />
            </div>

            <div>
              <SelectInput
                title={
                  <span className="flex items-center gap-1">
                    <span>{t("p-type")}</span>
                  </span>
                }
                placeholder={t("s-p-type")}
                value={selectedCurrency || ""}
                onValueChange={(e) => {
                  setSelectedCurrency(e as CurrencyEnum);
                  recalculateSelectedProducts({
                    currency: e as CurrencyEnum,
                  });
                }}
                options={[
                  {
                    options:
                      supportedPayments?.map((el) => ({
                        value: el,
                        label: el,
                      })) || [],
                  },
                ]}
                error={getInputError("payment_currency")}
                disabled={createSalePending}
              />
            </div>
          </div>
          <div className="border-t grid grid-cols-3 border-color-theme py-2 gap-3 px-6 flex-col lg:flex-row lg:items-center w-full">
            <EditSaleRate
              disabled={createSalePending}
              rateCDF={rateCDF}
              rateRWF={rateRWF}
              setRateCDF={(rate) => {
                setRateCDF(rate);
                recalculateSelectedProducts({ rate_CDF: rate });
              }}
              setRateRWF={(rate) => {
                setRateRWF(rate);
                recalculateSelectedProducts({ rate_RWF: rate });
              }}
              showRate={showRate}
              errorCDF={getInputError("rate_CDF")}
              errorRWF={getInputError("rate_RWF")}
            />
            <EditSaleComment
              title={t("comment")}
              comment={comment}
              setComment={setComment}
              actionTitle={t("save")}
            />
            <EditSaleTransactionDate
              title={t("t-date")}
              label={t("date")}
              date={transactionDate}
              setDate={setTransactionDate}
              // disabled={createSalePending}
              disabled={false}
              error={getInputError("transaction_date")}
              actionTitle={t("save")}
            />
          </div>
          {/* cash calculation cards */}
          <div className="bg-[#F9F9F9] dark:bg-[#191919] grid grid-cols-2 lg:grid-cols-3 border-t --border-b border-color-theme">
            <CardCash
              title={t("p-total")}
              value={
                <>
                  {price_total_in_selected_currency.toLocaleString()}{" "}
                  <span className="text-xs font-light text-blue-500">
                    {selectedCurrency}
                  </span>{" "}
                </>
              }
              subValue={
                <>
                  {t("b-currency")}:{" "}
                  <b className="text-yellow-600">
                    {price_total_branch_currency.toLocaleString()}{" "}
                    <span className="text-xs font-light">{branchCurrency}</span>
                  </b>
                </>
              }
              borderColor
            />

            <CardCash
              title={t("available-c")}
              value={
                <>
                  {totalPayed_PaymentType.toLocaleString()}{" "}
                  <span className="text-xs font-light text-blue-500">
                    {selectedCurrency}
                  </span>{" "}
                </>
              }
              subValue={
                <>
                  {t("b-currency")}:{" "}
                  <b className="text-yellow-600">
                    {totalPayed_branch_currency.toLocaleString()}{" "}
                    <span className="text-xs font-light">{branchCurrency}</span>
                  </b>
                </>
              }
              borderColor
            />

            <div
              className={classNames("relative", {
                "opacity-50 text-red-500": ignoreBalance,
              })}
            >
              <CardCash
                title={t("balance")}
                value={
                  <>
                    {Math.max(balance_selected_currency, 0).toLocaleString()}{" "}
                    <span className="text-xs font-light text-blue-500">
                      {selectedCurrency}
                    </span>{" "}
                  </>
                }
                subValue={
                  <>
                    {t("b-currency")}:{" "}
                    <b className="text-yellow-600">
                      {balance_branch_currency.toLocaleString()}{" "}
                      <span className="text-xs font-light">
                        {branchCurrency}
                      </span>
                    </b>
                  </>
                }
                borderColor
              />
            </div>
          </div>

          {/* payment record cards & input */}
          <div className="px-6 border-t border-color-theme pt-2">
            <div className="flex">
              <div className="flex-1">
                <h6 className="font-bold-">{t("pyd-cash")}</h6>
              </div>
            </div>
            <div className="grid pt-3 md:grid-cols-3 gap-6">
              {/* {branch && branch.branch && ( */}
              {true && (
                <>
                  {supportedPayments?.includes(CurrencyEnum.USD) && (
                    <PayedInputWrapper
                      title={t("rm-pym")}
                      value={`${Math.max(balance_USD, 0).toLocaleString()} `}
                      currency={CurrencyEnum.USD}
                    >
                      <Input
                        type="number"
                        value={payedDol}
                        onChange={(e) => setPayedDol(+e.target.value)}
                        inputSize="xl"
                        label="USD"
                        error={
                          getInputError("payed_USD") ||
                          !POSITIVE_VALUE_REGEX.test(String(payedDol))
                            ? t("invalid-amount")
                            : undefined
                        }
                        disabled={createSalePending}
                      />
                    </PayedInputWrapper>
                  )}

                  {supportedPayments?.includes(CurrencyEnum.RWF) && (
                    <PayedInputWrapper
                      title={t("rm-pym")}
                      value={`${Math.max(balance_RWF, 0).toLocaleString()}`}
                      currency={CurrencyEnum.RWF}
                    >
                      <Input
                        type="number"
                        inputSize="xl"
                        label="RWF"
                        value={payedFrw}
                        onChange={(e) => setPayedFrw(+e.target.value)}
                        error={
                          getInputError("payed_RWF") ||
                          !POSITIVE_VALUE_REGEX.test(String(payedFrw))
                            ? t("invalid-amount")
                            : undefined
                        }
                        disabled={createSalePending}
                      />
                    </PayedInputWrapper>
                  )}

                  {supportedPayments?.includes(CurrencyEnum.CDF) && (
                    <PayedInputWrapper
                      title={t("rm-pym")}
                      value={`${Math.max(balance_CDF, 0).toLocaleString()}`}
                      currency={CurrencyEnum.CDF}
                    >
                      <Input
                        type="number"
                        inputSize="xl"
                        label="CDF"
                        value={payedFc}
                        onChange={(e) => setPayedFc(+e.target.value)}
                        error={
                          getInputError("payed_CDF") ||
                          !POSITIVE_VALUE_REGEX.test(String(payedFc))
                            ? t("invalid-amount")
                            : undefined
                        }
                        disabled={createSalePending}
                      />
                    </PayedInputWrapper>
                  )}
                </>
              )}
            </div>
          </div>

          {/* balance input here */}
          <motion.div
            initial={{
              height: 0,
            }}
            animate={{
              height: balance_selected_currency > 0 ? "auto" : 0,
            }}
          >
            <div className="p-4 border-t mt-4 border-color-theme">
              {balance_selected_currency > 0 && (
                <div>
                  <h3 className="text-lg">{t("bal")}</h3>
                  <div
                    className={classNames("flex-- gap-2 pt-1 pb-2 w-full", {
                      "opacity-40": ignoreBalance,
                    })}
                  >
                    <div className="grid grid-cols-3 gap-3">
                      {/* balance total */}
                      <div className="flex-1 border px-2 py-1 pb-2 rounded-lg border-color-theme">
                        <span className="text-xs text-base-color">
                          {t("s-currency")}
                        </span>
                        <h2>
                          <b>
                            {Math.max(
                              balance_selected_currency,
                              0,
                            ).toLocaleString()}
                          </b>{" "}
                          {selectedCurrency}
                        </h2>
                      </div>

                      {/* ignore button */}
                      <div className="flex gap-2  border border-color-theme py-1 px-2 rounded-lg items-center">
                        <button
                          disabled={createSalePending}
                          className="text-2xl"
                          onClick={() => setIgnoreBalance(!ignoreBalance)}
                        >
                          {ignoreBalance ? (
                            <MdCheckBox className="text-blue-500" />
                          ) : (
                            <MdCheckBoxOutlineBlank />
                          )}
                        </button>

                        <div className="flex-1">
                          <h5 className="text-sm">{t("ig-bal")}</h5>
                          <p className="text-xs text-base-color">
                            {t("ig-bal-msg")}
                          </p>
                        </div>
                        {ignoreBalance && (
                          <MdWarning
                            className="text-2xl text-red-500"
                            // title={t("ig-bal-msg")}
                          />
                        )}
                      </div>

                      {branchCurrency !== selectedCurrency && (
                        <div className="flex-1 border px-2 py-1 pb-2 rounded-lg border-color-theme">
                          <span className="text-xs text-base-color">
                            {t("b-currency")}
                          </span>

                          <h2>
                            <b>
                              {Math.max(
                                balance_branch_currency,
                                0,
                              ).toLocaleString()}{" "}
                            </b>
                            {branchCurrency}
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={classNames(
                      "grid grid-cols-1 lg:grid-cols-3 gap-2",
                      {
                        "opacity-40": ignoreBalance,
                      },
                    )}
                  >
                    <Input
                      type="date"
                      value={balancePayDate}
                      onChange={(e) => setBalancePayDate(e.target.value)}
                      error={getInputError("balance_pay_date")}
                      label={t("p-date")}
                      disabled={createSalePending}
                    />
                    <Input
                      label="Contacts"
                      type="text"
                      value={balanceContacts}
                      onChange={(e) => setBalanceContacts(e.target.value)}
                      error={getInputError("balance_contacts")}
                      disabled={createSalePending}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <ProductSellItems
          saleId={saleId}
          selectedCurrency={selectedCurrency!}
          branchCurrency={branchCurrency}
          rateCDF={rateCDF}
          rateRWF={rateRWF}
          productsList={productsList}
          setProductsList={setProductsList}
          disabled={createSalePending}
        />
      </div>

      <div className="sticky bottom-0 right-0 left-0 bg-gray-600/30 backdrop-blur-lg border-t border-color-theme p-2 flex justify-end">
        <Button
          disabled={saleSuccess || createSalePending}
          loading={createSalePending}
          size="lg"
          variant="primary"
          onClick={onSubmitData}
        >
          {t("title-product")}
        </Button>
      </div>
    </>
  );
}

// function calculateSalesData(arg0: {
//   branchCurrency: CurrencyEnum;
//   payedDol: number;
//   payedFc: number;
//   payedFrw: number;
//   productsList: DiversSaleItemType_Details[];
//   rateCDF: number;
//   rateRWF: number;
//   selectedCurrency: CurrencyEnum;
// }): any {
//   throw new Error("Function not implemented.");
// }
// const SaleParentLinkedBanner: FunctionComponent<{
//   clientName: string;
//   onReset: () => void;
// }> = ({ clientName, onReset }) => {
//   const t = useTranslations("sell-invitation");
//   return (
//     <div className="border-b bg-blue-500/10 border-color-theme px-6 p-2 flex gap-2 items-center">
//       <div className="flex items-center gap-2 flex-1">
//         <MdLink className="text-2xl text-blue-500" />

//         <button className="text-sm text-base-color">
//           <span className="font-bold text-core-color">{clientName}</span>{" "}
//           {t("c-link-msg")}
//         </button>
//       </div>
//       <div>
//         <button
//           onClick={onReset}
//           className="text-xs text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-lg"
//         >
//           {t("apply-val")}
//         </button>
//       </div>
//     </div>
//   );
// };

// import React from "react";

// const SaleForm = () => {
//   return <div className="p-2">Sale Form Screen</div>;
// };

// export default SaleForm;
