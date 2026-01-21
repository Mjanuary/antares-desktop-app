import { FaReceipt } from "react-icons/fa";
import { MdAccountCircle, MdPrint } from "react-icons/md";
import { RiBankFill } from "react-icons/ri";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
// import { numberReadFormat, dateFormat } from "../../utils";
import { Button } from "../../../components/ui/button";
import { SaleBalanceCard } from "../../../components/sales-components/balance-sales-card";
import { DeleteDiverSale } from "../../../components/sales-components/delete-diver-sale";
import {
  BalanceProductType,
  BalanceStatusEnum,
  BalanceType,
  BranchType,
  CurrencyEnum,
  DiverCategoryType,
  DiversSaleItemType,
  DiversSalesType,
  DiverSubCategoryType,
  DiverType,
  HouseType,
} from "../../../../types/app.logic.types";
import { dateFormat, numberReadFormat } from "../../../utils/client-utils";

interface MyComponentProps {
  params: {
    saleId: string;
  };
}

const balance: BalanceType = {
  id: "id-here",
  balance_parent_id: "z.string().nullable()",
  client_name: " z.string()",
  product_type: BalanceProductType.DIVERS,
  product_id: "z.string().nullable()",
  payment_currency: CurrencyEnum.CDF,
  branch_currency: CurrencyEnum.CDF,
  rate_RWF: 1232,
  rate_CDF: 1232,
  amount: 1232,
  amount_bc: 1232,
  payed_amount: 1232,
  payed_amount_bc: 1232,
  sale_id: "z.string().nullable()",
  parent_sale_id: "z.string().nullable()",
  recorded_date: new Date(),
  pay_date: new Date(),
  branch_id: "z.string()",
  house_id: "z.string().nullable()",
  active: true,
  balance_status: BalanceStatusEnum.COMPLETED,
  created_date: new Date(),
  updated_date: new Date(),
  balance_contacts: "",
  comment: "",
  recorded_by: " z.string().nullable()",

  // sync changes
  app_connection: "z.string().nullable().optional()",
  row_version: 1,
  row_deleted: null,
};

const branch: BranchType = {
  id: "branch-id",
  name: "Branch Name",
  country: "Country Name",
  address: "Address",
  contacts: "Contacts",
  branch_currency: CurrencyEnum.CDF,
  supported_currency: CurrencyEnum.CDF,
  rate_in: null,
  rate_out: null,
  active: true,
  active_store: true,
  created_date: new Date(),
  updated_date: new Date(),
  show_rate_card: true,
  remember_rate_on_sale: true,
  remember_price_on_re_sale: true,
  show_rate_on_all_forms: true,

  // sync changes
  app_connection: null,
  row_version: 1,
  row_deleted: null,
};

const house: HouseType = {
  name: "House Name",
  country: "Country Name",
  row_version: 1,
  id: "house-id",
  address: "Address",
  contacts: "Contacts",
  active: true,
  comment: "Some comment",
  created_date: new Date(),
  updated_date: new Date(),
  app_connection: "",
  row_deleted: null,
};

const saleDetailsdata: DiversSalesType = {
  id: "sale-id",
  balance: 1232,
  balance_bc: 1232,
  branch_currency: CurrencyEnum.CDF,
  branch_id: "branch-id",
  client_name: "Client Name",
  comment: "Some comment",
  created_time: new Date(),
  deposit_id: null,
  house_id: "house-id",
  payment_currency: CurrencyEnum.CDF,
  price_total: 1232,
  price_total_bc: 1232,
  recorded_by: "recorder-id",
  rate_CDF: 1232,
  rate_RWF: 1232,
  transaction_date: new Date(),
  total_payed_cash: 1232,
  total_payed_cash_bc: 1232,
  payed_USD: 0,
  payed_RWF: 0,
  payed_CDF: 1232,
  row_version: 1,
  row_deleted: null,
  updated_time: new Date(),
  total_products: 12,
  receipt_id: null,
  client_phone: "contents-id",
  sale_id: "sale-id",
  parent_sale_id: "parent-sale-id",
  client_id: "client-id",
  app_connection: "deposit-id",
};

const products: {
  diver_sales_items: DiversSaleItemType;
  divers_category: DiverCategoryType;
  divers_sub_category: DiverSubCategoryType;
  product: DiverType | null;
}[] = [
  {
    diver_sales_items: {
      id: "string;",
      price_total: 123,
      price_total_bc: 123,
      recorded_by: "string;",
      created_time: new Date(),
      updated_time: new Date(),
      row_version: 1,
      app_connection: null,
      row_deleted: null,
      bonus: 0,
      designed: false,
      price_unit: 123,
      quantity: 123,
      product_id: "product-id",
      product_to_branch_id: "product-to-branch-id",
      printed: false,
      designed_by: "",
      sale_id: "sale-id",
    },
    divers_category: {
      id: "category-id",
      name: "Category Name",
      description: "Category Description",
      active: true,
      row_version: 1,
      created_date: new Date(),
      app_connection: null,
      row_deleted: null,
    },
    divers_sub_category: {
      id: "sub-category-id",
      name: "Sub Category Name",
      description: "Sub Category Description",
      active: true,
      row_version: 1,
      created_date: new Date(),
      category_id: "category-id",
      created_by: "creator-id",
      app_connection: null,
      row_deleted: null,
    },
    product: {
      id: "product-id",
      cover_image_url: "https://via.placeholder.com/150",
      name: "Product Name",
      description: "Product Description",
      active: true,
      public: false,
      row_version: 1,
      app_connection: null,
      row_deleted: null,
      created_by: "creator-id",
      colors: [],
      custom_diver: false,
      diver_category_id: "category-id",
      diver_sub_category_id: "sub-category-id",
      code: "P001",
      images: [],
      notes: "",
      paper_size: [],
      thumbnail: "",
      bar_code: "",
      created_time: new Date(),
      updated_time: new Date(),
      paper_colors: [],
      qr_code: "janvier interation",
    },
  },
];

export default function SaleDetails({ params }: MyComponentProps) {
  // const { status } = useAuth();
  // const haveAccess = userHaveAccess(AccessCodes.DiversSaleView, branch);
  // const deleteAccess = userHaveAccess(AccessCodes.DiversSaleDelete, branch);
  const haveAccess = true;
  const deleteAccess = true;

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // const pageLoading = status === "loading";

  // const { data, isLoading } = useQuery({
  //   queryKey: ["diver-sales-details", params.saleId],
  //   queryFn: () => getDiverSaleDetails(params.saleId),
  //   enabled: !!params.saleId && !pageLoading && haveAccess,
  //   refetchOnWindowFocus: false,
  // });

  // const t = useTranslations("sales-details");
  const t = (E: string) => E;

  // if (status === "loading" || isLoading) return <LoadingPage />;
  // if (!haveAccess) return <NoAccessPage />;

  // if (!data || !data?.sale)
  //   return (
  //     <div>
  //       <div className="height-offset-top-navigation" />
  //       <div className="p-3 rounded bg-red-500/10  mt-4 text-center text-red-500 container mx-auto">
  //         <h3 className="text-lg">{t("no-sales-title")}</h3>
  //         <p className="text-xs"> {t("no-sales-description")}</p>
  //       </div>
  //     </div>
  //   );
  const sale = saleDetailsdata;
  const recorder = { name: "Recorder Name" };
  // const { products } = {} as { products: any[]; sale: any };
  const saleBranch = branch;
  const showBranchCurrency = sale.branch_currency !== sale.payment_currency;

  return (
    <>
      {/* {selectedReceipt && (
        <Modal
          title={t("print-receipt")}
          size="lg"
          onClose={() => setSelectedReceipt(null)}
        >
          <PrintReceiptContainer
            printButtonSize="lg"
            printButtonVariant="primary"
            receiptId={selectedReceipt}
          />
        </Modal>
      )} */}

      <div>
        <div className="mx-auto">
          <div className="flex lg:flex-row flex-col lg:items-center lg:justify-between border-b border-color-theme p-2 bg-white/90 dark:bg-gray-700/80 backdrop-blur-sm sticky top-12 pt-2 z-10">
            <div className="flex gap-2 items-center">
              <FaReceipt className="text-3xl" />

              <div className="flex flex-col">
                <h2 className="text-lg">{t("sale-details")}</h2>
                <span className="text-xs -mt-1 text-primary-200">
                  {sale?.client_name || sale.id}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 lg:pt-0 mx-auto lg:mx-0 w-fit">
              <Button
                onClick={() => setSelectedReceipt(sale.id)}
                variant="secondary"
                icon={<MdPrint />}
              >
                {t("print-receipt")}
              </Button>

              {deleteAccess && !sale.deposit_id && (
                <Button variant="destructive">{t("de-sale")}</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">
            <div className="border-r flex border-color-theme p-2 flex-col gap-3 px-4">
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("c-details")}
                </span>
                <div className=" flex px-3 lg:gap-2  border flex-col lg:flex-row border-color-theme rounded-xl">
                  <div className="flex gap-1 px-1- flex-1 items-center">
                    <MdAccountCircle className="text-4xl text-base-color" />
                    <div className="px-2- flex-1 border-color-theme p-1 flex flex-col">
                      <span className="text-xs text-base-color">
                        {t("c-name")}
                      </span>
                      <div className="flex gap-1 -mt-1">
                        <span>{sale.client_name}</span>
                      </div>
                    </div>
                  </div>

                  {house && (
                    <div className="flex-1 flex items-center">
                      <RiBankFill className="text-4xl text-base-color" />
                      <div className="border-l- px-3 flex-1 px-2-- border-color-theme p-2 flex flex-col">
                        <span className="text-xs text-base-color">
                          {t("h")}
                        </span>
                        <div className="flex gap-1">
                          <span>{house.name}</span> / {house.address}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("b-details")}
                </span>
                <div className="border grid gap-3 lg:grid-cols-3 p-2 px-4 rounded-lg border-color-theme">
                  <div className="flex flex-col">
                    <span className="text-sm text-base-color">{t("b")}</span>
                    <h5>{saleBranch?.name}</h5>
                  </div>

                  <div className="flex flex-col lg:px-4 py-2 lg:py-0 lg:border-y-0 border-y lg:border-x border-color-theme">
                    <span className="text-sm text-base-color">
                      {t("b-currency")} {`(${t("now")})`}
                    </span>
                    <h5>{saleBranch?.branch_currency} </h5>
                  </div>

                  {saleBranch?.branch_currency !== sale.branch_currency && (
                    <div className="flex flex-col px-4 border-x border-color-theme">
                      <span className="text-sm text-base-color">
                        {t("b-currency")} {`(${t("then")})`}
                      </span>
                      <h5>{sale?.branch_currency} </h5>
                    </div>
                  )}

                  <div className="flex flex-col lg:px-3">
                    <span className="text-sm text-base-color">{t("rate")}</span>
                    <div className="flex bg-parent">
                      <h5 className="flex-1">
                        {numberReadFormat(sale.rate_CDF)}{" "}
                        <span className="text-xs font-extralight">
                          {CurrencyEnum.CDF}
                        </span>
                      </h5>

                      <h5 className="flex-1">
                        {numberReadFormat(sale.rate_RWF)}{" "}
                        <span className="text-xs font-extralight">
                          {CurrencyEnum.RWF}
                        </span>
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("prices")}
                </span>
                <div className="border px-4 border-color-theme rounded-lg p-2 gap-3 lg:gap-0 grid-cols-2 lg:grid-cols-4 grid">
                  <div>
                    <span className="text-base-color text-sm">
                      {t("p-type")}
                    </span>
                    <h5 className="font-bold text-green-500">
                      {sale.payment_currency}
                    </h5>
                  </div>

                  <div>
                    <span className="text-base-color text-sm">{t("pt")}</span>
                    <h5 className="whitespace-nowrap">
                      {numberReadFormat(sale.price_total)}{" "}
                      <span>{sale.payment_currency}</span>
                    </h5>
                    {showBranchCurrency && (
                      <h5 className="text-xs text-base-color">
                        {t("b-currency")}:{" "}
                        <span className="whitespace-nowrap text-yellow-600">
                          <b>{numberReadFormat(sale.total_payed_cash_bc)}</b>{" "}
                          <span>{sale.branch_currency}</span>
                        </span>
                      </h5>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("pym")}
                </span>

                <div className="rounded-xl border border-color-theme">
                  <div className="flex flex-col lg:flex-row text-center rounded-lg p-1 gap-1 ">
                    {sale.payed_USD && +sale.payed_USD > 0 && (
                      <div className="flex flex-col gap-1 flex-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("pyd-in")} {CurrencyEnum.USD}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale.payed_USD)}{" "}
                          <span className="font-extralight text-xs">
                            {CurrencyEnum.USD}
                          </span>
                        </h5>
                      </div>
                    )}

                    {sale.payed_RWF && +sale.payed_RWF > 0 && (
                      <div className="flex flex-1 flex-col gap-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("pyd-in")} {CurrencyEnum.RWF}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale.payed_RWF)}{" "}
                          <span className="font-extralight text-xs">
                            {CurrencyEnum.RWF}
                          </span>
                        </h5>
                      </div>
                    )}

                    {sale.payed_CDF && +sale.payed_CDF > 0 && (
                      <div className="flex flex-1 flex-col gap-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("pyd-in")} {CurrencyEnum.CDF}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale.payed_CDF)}{" "}
                          <span className="font-extralight text-xs">
                            {CurrencyEnum.CDF}
                          </span>
                        </h5>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 p-4">
                    <div className="text-left">
                      <span className="text-sm block mb-1 text-base-color">
                        {t("exp-cash")}
                      </span>
                      <h5 className="text-xl font-bold">
                        {numberReadFormat(sale.price_total)}{" "}
                        <span className="font-light text-xs text-green-500">
                          {sale.payment_currency}
                        </span>
                      </h5>
                      {showBranchCurrency && (
                        <h6 className="text-xs text-base-color">
                          {t("b-currency")}:{" "}
                          <b className="whitespace-nowrap text-yellow-600">
                            {numberReadFormat(sale.price_total_bc)}{" "}
                            <span className="font-extralight">
                              {sale.branch_currency}
                            </span>
                          </b>
                        </h6>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm block mb-1 text-base-color">
                        {t("rc-cash")}
                      </span>
                      <h5 className="text-xl font-bold">
                        {numberReadFormat(sale.total_payed_cash)}{" "}
                        <span className="font-light text-xs text-green-500">
                          {sale.payment_currency}
                        </span>
                      </h5>

                      {showBranchCurrency && (
                        <h6 className="text-xs text-base-color">
                          {t("b-currency")}:{" "}
                          <b className="whitespace-nowrap text-yellow-600">
                            {numberReadFormat(sale.total_payed_cash_bc)}{" "}
                            <span className="font-extralight">
                              {sale.branch_currency}
                            </span>
                          </b>
                        </h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {balance && <SaleBalanceCard balance={balance} />}

              <div className="grid lg:grid-cols-3 pt-6 lg:pt-0">
                <div className="col-span-2 pr-4">
                  {!!sale.comment && (
                    <div className="">
                      <span className="text-sm text-base-color">
                        {t("cmnt")}
                      </span>
                      <p className="border border-color-theme mt-1 p-2 rounded-lg">
                        {sale.comment}
                      </p>
                    </div>
                  )}
                </div>

                {sale.payment_currency && +sale.payment_currency > 0 && (
                  <div>
                    <span>{t("blnc")}</span>
                    <div className=" border p-1 rounded-2xl border-color-theme">
                      <div className="bg-color-overlay-theme px-4 py-2 rounded-xl">
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale.balance)}{" "}
                          <span className="text-xs font-light">
                            {sale.payment_currency}
                          </span>
                        </h5>
                        {showBranchCurrency && (
                          <span className="text-xs block text-base-color -mt-0.5">
                            {t("b-currency")}:{" "}
                            <b className="whitespace-nowrap text-yellow-600">
                              {numberReadFormat(sale.balance_bc)}{" "}
                              <span className="font-extralight">
                                {sale.branch_currency}
                              </span>
                            </b>
                          </span>
                        )}
                      </div>

                      <div className="p-3 py-2 text-xs">
                        <p className="text-base-color">{t("blnc-expl")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid lg:grid-cols-none grid-cols-2 gap-4 lg:gap-2 lg:flex justify-between border-t lg:border-t-0 border-color-theme p-4">
                {[
                  { title: t("rec-by"), value: recorder?.name },
                  {
                    title: t("t-date"),
                    value: dateFormat(sale.transaction_date),
                  },
                  {
                    title: t("rec-date"),
                    value: dateFormat(sale.created_time),
                  },
                ].map(({ title, value }) => (
                  <div key={title}>
                    <span className="text-base-color text-sm">{title}</span>
                    <h5>{value}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t lg:border-t-0 lg:border-r border-color-theme">
              <div className="">
                <h2 className="text-2xl p-2 flex gap-2 items-center">
                  {t("products")}{" "}
                  <Badge variant="info">{products.length}</Badge>{" "}
                </h2>
                {products.map(
                  (
                    {
                      diver_sales_items,
                      divers_category,
                      divers_sub_category,
                      product,
                    },
                    index,
                  ) => (
                    <div
                      className="p-2 border-t border-color-theme flex gap-2"
                      key={index}
                    >
                      {product?.cover_image_url && (
                        <img
                          src={product?.cover_image_url}
                          className="w-[150px] h-[150px] bg-contain bg-gray-500 rounded-lg"
                          alt="Product cover"
                        />
                      )}

                      <div className="flex-1 pb-2">
                        <h2 className="text-xl">{product?.name}</h2>

                        <div className="grid grid-cols-2 gap-1 pt-2">
                          {[
                            {
                              title: t("pu"),
                              value: numberReadFormat(
                                diver_sales_items.price_unit,
                              ),
                              currency: sale.payment_currency,
                            },
                            {
                              title: t("q"),
                              value: numberReadFormat(
                                diver_sales_items.quantity,
                              ),
                            },
                            {
                              title: t("pt"),
                              value: numberReadFormat(
                                diver_sales_items.price_total,
                              ),
                              currency: sale.payment_currency,
                            },
                            {
                              title: t("bon"),
                              value: numberReadFormat(diver_sales_items.bonus),
                            },
                            { title: t("cat"), value: divers_category },
                            {
                              title: t("sub-cat"),
                              value: divers_sub_category,
                            },
                          ].map((el) => {
                            if (!el.value) return null;
                            return (
                              <div
                                key={el.title}
                                className="flex flex-col border-b p-1 border-color-theme px-2"
                              >
                                <span className="text-xs opacity-50">
                                  {el.title}:
                                </span>
                                <b>
                                  {/* {el.value}{" "} */}
                                  {el.currency && (
                                    <span className="font-light text-sm">
                                      {el.currency}
                                    </span>
                                  )}
                                </b>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteAccess && <DeleteDiverSale />}
    </>
  );
}
function useAuth(): { status: any } {
  throw new Error("Function not implemented.");
}

function useUserContext(): { branch: any } {
  // throw new Error("Function not implemented.");
  return { branch: { branchId: "" } };
  // return {
  //   products: null,
  //   sale: { balance, branch: saleBranch, house, recorder, sale },
  // };
}
