import React, { FunctionComponent, useEffect, useState } from "react";
import { MdAccountCircle, MdArrowBack, MdClose, MdPrint } from "react-icons/md";
import { RiBankFill } from "react-icons/ri";
import { SaleBalanceCard } from "../../../components/sales-components/balance-sales-card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { dateFormat, numberReadFormat } from "../../../utils/client-utils";
import { BalanceType, CurrencyEnum } from "../../../../types/app.logic.types";
import classNames from "classnames";
import { TopNavigation } from "../../../components/top-navigation";

interface SaleDetail {
  id: string;
  parent_sale_id: string | null;
  branch_id: string;
  client_id: string | null;
  client_name: string | null;
  client_name_db: string | null;
  client_phone: string | null;
  house_id: string;
  transaction_date: string;
  payment_currency: string;
  branch_currency: string;
  price_total: number;
  price_total_bc: number;
  rate_RWF: number;
  rate_CDF: number;
  payed_USD: number;
  payed_CDF: number;
  payed_RWF: number;
  total_payed_cash: number;
  total_payed_cash_bc: number;
  balance: number;
  balance_bc: number;
  comment: string;
  deposit_id: string | null;
  receipt_id: string | null;
  total_products: number;
  recorded_by: string;
  app_connection: string | null;
  row_version: number;
  row_deleted: string | null;
  created_time: string;
  updated_time: string;
  sync_status: string;
  recorded_by_name: string;
  house_name: string;
  house_address: string;
  house_location: string;
}

interface SaleProduct {
  id: string;
  sale_id: string;
  product_id: string;
  product_to_branch_id: string;
  recorded_by: string;
  quantity: number;
  bonus: number;
  price_unit: number;
  price_total: number;
  price_total_bc: number;
  printed: number;
  designed: number;
  designed_by: string | null;
  app_connection: string | null;
  row_version: number;
  row_deleted: string | null;
  created_time: string;
  updated_time: string;
  sync_status: string;
  product_name: string;
  local_image_filename: string;
}

export interface SaleBalanceType {
  id: string;
  balance_id: string;
  sale_id: string;
  product_type: string;
  branch_id: string;
  house_id: string | null;
  recorded_date: Date;
  recorded_by: string | null;
  active: boolean;

  payment_currency: string;
  branch_currency: string;

  rate_RWF: number | null;
  rate_CDF: number | null;

  payed_USD: number | null;
  payed_CDF: number | null;
  payed_RWF: number | null;
  total_payed: number | null;
  total_payed_bc: number | null;
  created_date: Date;
  updated_date: Date;
  deposit_id: string | null;
  app_connection: string | null;
  row_version: number;
  row_deleted: string;
  sync_status: string;
}

interface SaleDetailsData {
  sale_details: SaleDetail;
  products: SaleProduct[];
  balances: BalanceType[];
}

import { useTranslation } from "react-i18next";

export const SaleDetails: React.FunctionComponent<{
  saleId: string;
  onClose: () => void;
}> = ({ saleId, onClose }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<SaleDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!saleId) return;

      setLoading(true);
      try {
        const result = await window.electronAPI.getSaleDetails(saleId);
        setData(result);
      } catch (error) {
        console.error("Failed to load sale details", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [saleId]);

  console.log({ data });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-zinc-500">Loading sale details...</div>
      </div>
    );
  }

  if (!data || !data.sale_details) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-red-500">Sale not found</div>
      </div>
    );
  }

  const { sale_details, products, balances } = data;

  const showBranchCurrency = true;
  return (
    <>
      <div>
        <div className="mx-auto">
          <TopNavigation title={t("sales.details.title")} onBack={onClose}>
            <Button variant="secondary" icon={<MdPrint />}>
              {t("sales.details.print_receipt")}
            </Button>
          </TopNavigation>

          <div className="flex grid-cols-1-- lg:grid-cols-2--  min-h-[90vh]">
            <div className="border-r flex-1 flex border-color-theme p-2 flex-col gap-3 px-4">
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("sales.details.client_details")}
                </span>
                <div className=" flex px-3 lg:gap-2  border flex-col-- ---lg:flex-row border-color-theme rounded-xl">
                  <div className="flex gap-1 px-1- flex-1 items-center">
                    <MdAccountCircle className="text-4xl text-base-color" />
                    <div className="px-2- flex-1 border-color-theme p-1 flex flex-col">
                      <span className="text-xs text-base-color">
                        {t("sales.details.client_name")}
                      </span>
                      <div className="flex gap-1 -mt-1">
                        <span>
                          {sale_details?.client_name ||
                            sale_details.client_name_db}
                        </span>
                      </div>
                    </div>
                  </div>

                  {sale_details.house_id && (
                    <div className="flex-1 flex items-center">
                      <RiBankFill className="text-4xl text-base-color" />
                      <div className="border-l- px-3 flex-1 px-2-- border-color-theme p-2 flex flex-col">
                        <span className="text-xs text-base-color">
                          {t("sales.details.house")}
                        </span>
                        <div className="flex gap-1">
                          <span>{sale_details.house_name}</span> /{" "}
                          {sale_details.house_address}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("sales.details.branch_details")}
                </span>
                <div className="border flex flex-col rounded-lg border-color-theme">
                  {/* <div className="flex flex-col">
                    <span className="text-sm text-base-color">{t("b")}</span>
                    <h5>{sale_details.?.name}</h5>
                  </div> */}

                  <div className="flex lg:px-4 gap-4 p-2 items-center border-color-theme">
                    <span className="text-sm text-base-color">
                      {t("sales.details.branch_currency")}{" "}
                      {`(${t("sales.details.now")})`}
                    </span>
                    <h5>{sale_details?.branch_currency} </h5>
                  </div>

                  {!!(
                    sale_details?.branch_currency !==
                      sale_details.payment_currency &&
                    sale_details?.branch_currency
                  ) && (
                    <div className="flex lg:px-4 p-2 border-y borrder-t border-color-theme">
                      <span className="text-sm text-base-color">
                        {t("sales.details.branch_currency")}{" "}
                        {`(${t("sales.details.then")})`}
                      </span>
                      <h5>{sale_details?.branch_currency} </h5>
                    </div>
                  )}

                  <div className="flex lg:px-4 p-2 gap-4 border-t border-color-theme">
                    <span className="text-sm text-base-color">
                      {t("sales.details.rate")}
                    </span>
                    <div className="flex bg-parent gap-4 items-center">
                      <h5 className="flex-1 flex items-center gap-1">
                        {numberReadFormat(sale_details.rate_CDF)}{" "}
                        <span className="text-xs font-extralight">
                          {CurrencyEnum.CDF}
                        </span>
                      </h5>

                      <h5 className="flex-1 flex items-center gap-1">
                        {numberReadFormat(sale_details.rate_RWF)}{" "}
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
                  {t("sales.details.prices")}
                </span>
                <div className="border px-4 border-color-theme rounded-lg p-2 gap-3 lg:gap-0 flex justify-between items-center gap-4">
                  <div>
                    <span className="text-base-color text-sm">
                      {t("sales.details.payment_currency")}
                    </span>
                    <h5 className="font-bold text-green-500">
                      {sale_details.payment_currency}
                    </h5>
                  </div>

                  <div>
                    <span className="text-base-color text-sm">
                      {t("sales.details.price_total")}
                    </span>
                    <h5 className="whitespace-nowrap">
                      {numberReadFormat(sale_details.price_total)}{" "}
                      <span>{sale_details.payment_currency}</span>
                    </h5>
                    {showBranchCurrency && (
                      <h5 className="text-xs text-base-color">
                        {t("sales.details.branch_currency")}:{" "}
                        <span className="whitespace-nowrap text-yellow-600">
                          <b>
                            {numberReadFormat(sale_details.total_payed_cash_bc)}
                          </b>{" "}
                          <span>{sale_details.branch_currency}</span>
                        </span>
                      </h5>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-base-color opacity-50 font-extralight uppercase text-xs">
                  {t("sales.details.payment_details")}
                </span>

                <div className="rounded-xl border border-color-theme">
                  <div className="flex flex-col lg:flex-row text-center rounded-lg p-1 gap-1 ">
                    {!!(
                      sale_details.payed_USD && +sale_details.payed_USD > 0
                    ) && (
                      <div className="flex flex-col gap-1 flex-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("sales.details.paid_in")} {CurrencyEnum.USD}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale_details.payed_USD)}{" "}
                          <span className="font-extralight text-xs">
                            {CurrencyEnum.USD}
                          </span>
                        </h5>
                      </div>
                    )}

                    {!!(
                      sale_details.payed_RWF && +sale_details.payed_RWF > 0
                    ) && (
                      <div className="flex flex-1 flex-col gap-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("sales.details.paid_in")} {CurrencyEnum.RWF}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale_details.payed_RWF)}{" "}
                          <span className="font-extralight text-xs">
                            {CurrencyEnum.RWF}
                          </span>
                        </h5>
                      </div>
                    )}

                    {!!(
                      sale_details.payed_CDF && +sale_details.payed_CDF > 0
                    ) && (
                      <div className="flex flex-1 flex-col gap-1 bg-color-overlay-theme p-3 rounded-lg">
                        <span className="text-base-color text-xs">
                          {t("sales.details.paid_in")} {CurrencyEnum.CDF}
                        </span>
                        <h5 className="text-xl font-bold">
                          {numberReadFormat(sale_details.payed_CDF)}{" "}
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
                        {t("sales.details.expected_cash")}
                      </span>
                      <h5 className="text-xl font-bold">
                        {numberReadFormat(sale_details.price_total)}{" "}
                        <span className="font-light text-xs text-green-500">
                          {sale_details.payment_currency}
                        </span>
                      </h5>
                      {showBranchCurrency && (
                        <h6 className="text-xs text-base-color">
                          {t("sales.details.branch_currency")}:{" "}
                          <b className="whitespace-nowrap text-yellow-600">
                            {numberReadFormat(sale_details.price_total_bc)}{" "}
                            <span className="font-extralight">
                              {sale_details.branch_currency}
                            </span>
                          </b>
                        </h6>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm block mb-1 text-base-color">
                        {t("sales.details.total_paid_cash")}
                      </span>
                      <h5 className="text-xl font-bold">
                        {numberReadFormat(sale_details.total_payed_cash)}{" "}
                        <span className="font-light text-xs text-green-500">
                          {sale_details.payment_currency}
                        </span>
                      </h5>

                      {showBranchCurrency && (
                        <h6 className="text-xs text-base-color">
                          {t("sales.details.base_currency")}:{" "}
                          <b className="whitespace-nowrap text-yellow-600">
                            {numberReadFormat(sale_details.total_payed_cash_bc)}{" "}
                            <span className="font-extralight">
                              {sale_details.branch_currency}
                            </span>
                          </b>
                        </h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {balances &&
                balances.map((balance) => (
                  <SaleBalanceCard
                    balance={{
                      id: balance.id,
                      balance_parent_id: balance.id,
                      client_name: sale_details.client_name || "",
                      product_type: balance.product_type || "",
                      product_id: sale_details.id,
                      payment_currency:
                        balance.payment_currency as CurrencyEnum,
                      branch_currency: balance.branch_currency as CurrencyEnum,
                      rate_RWF: balance.rate_RWF || 0,
                      rate_CDF: balance.rate_CDF || 0,
                      amount: balance.amount || 0,
                      amount_bc: balance.amount_bc || 0,
                      payed_amount: balance.payed_amount || 0,
                      payed_amount_bc: balance.payed_amount_bc,
                      sale_id: balance.sale_id,
                      parent_sale_id: balance?.parent_sale_id,
                      recorded_date: balance.recorded_date,
                      pay_date: balance.pay_date,
                      branch_id: balance.branch_id,
                      house_id: balance.house_id,
                      active: balance.active,
                      balance_status: balance.balance_status,
                      created_date: balance.created_date,
                      updated_date: balance.updated_date,
                      balance_contacts: balance.balance_contacts,
                      recorded_by: balance.recorded_by,
                      // sync changes
                      app_connection: balance.app_connection,
                      row_version: balance.row_version,
                      // local columns
                      sync_status: balance.sync_status,
                      comment: balance.comment,
                      row_deleted: balance.row_deleted,
                    }}
                  />
                ))}

              <div className="grid lg:grid-cols-3 pt-6 lg:pt-0">
                <div className="col-span-2 pr-4">
                  {!!sale_details.comment && (
                    <div className="">
                      <span className="text-sm text-base-color">
                        {t("sales.details.comment")}
                      </span>
                      <p className="border border-color-theme mt-1 p-2 rounded-lg">
                        {sale_details.comment}
                      </p>
                    </div>
                  )}
                </div>

                {sale_details.payment_currency &&
                  +sale_details.payment_currency > 0 && (
                    <div>
                      <span>{t("sales.details.balance")}</span>
                      <div className=" border p-1 rounded-2xl border-color-theme">
                        <div className="bg-color-overlay-theme px-4 py-2 rounded-xl">
                          <h5 className="text-xl font-bold">
                            {numberReadFormat(sale_details.balance)}{" "}
                            <span className="text-xs font-light">
                              {sale_details.payment_currency}
                            </span>
                          </h5>
                          {showBranchCurrency && (
                            <span className="text-xs block text-base-color -mt-0.5">
                              {t("sales.details.base_currency")}:{" "}
                              <b className="whitespace-nowrap text-yellow-600">
                                {numberReadFormat(sale_details.balance_bc)}{" "}
                                <span className="font-extralight">
                                  {sale_details.branch_currency}
                                </span>
                              </b>
                            </span>
                          )}
                        </div>

                        <div className="p-3 py-2 text-xs">
                          <p className="text-base-color">
                            {t("sales.details.balance_explanation")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="grid lg:grid-cols-none grid-cols-2 gap-4 lg:gap-2 lg:flex justify-between border-t lg:border-t-0 border-color-theme p-4">
                {[
                  {
                    title: t("sales.details.recorded_by"),
                    value: sale_details?.recorded_by_name,
                  },
                  {
                    title: t("sales.details.transaction_date"),
                    value: dateFormat(sale_details.transaction_date),
                  },
                  {
                    title: t("sales.details.recorded_date"),
                    value: dateFormat(sale_details.created_time),
                  },
                ].map(({ title, value }) => (
                  <div key={title}>
                    <span className="text-base-color text-sm">{title}</span>
                    <h5>{value}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="border-t lg:border-t-0 lg:border-r border-color-theme w-full"
              style={{ maxWidth: "420px" }}
            >
              <div className="">
                <h2 className="text-2xl p-2 flex gap-2 items-center">
                  {t("sales.details.products")}{" "}
                  <Badge variant="info">{products.length}</Badge>{" "}
                </h2>
                {products.map((productSaleItem, index) => (
                  <div
                    className="p-2 border-t border-color-theme flex gap-2"
                    key={index}
                  >
                    {productSaleItem?.local_image_filename && (
                      <img
                        src={`media://${productSaleItem?.local_image_filename}`}
                        className="w-[150px] h-[150px] bg-contain bg-gray-500 rounded-lg"
                        alt="Product cover"
                      />
                    )}

                    <div className="flex-1 pb-2">
                      <h2 className="text-xl">
                        {productSaleItem.product_name}
                      </h2>

                      <div className="grid grid-cols-2 gap-1 pt-2">
                        {[
                          {
                            title: t("sales.details.quantity"),
                            value: numberReadFormat(productSaleItem.quantity),
                          },
                          {
                            title: t("sales.details.price_unit"),
                            value: numberReadFormat(productSaleItem.price_unit),
                            currency: sale_details?.branch_currency,
                          },
                          {
                            title: t("sales.details.price_total"),
                            value: numberReadFormat(
                              productSaleItem.price_total,
                            ),
                            currency: sale_details?.branch_currency,
                          },
                          {
                            title: t("sales.details.bonus"),
                            value: numberReadFormat(productSaleItem.bonus),
                          },
                        ].map((el, index) => {
                          if (!el.value) return null;
                          return (
                            <div
                              key={el.title}
                              className={classNames(
                                "flex flex-col p-1 border-color-theme px-2",
                                {
                                  "border-b": index <= 1,
                                },
                              )}
                            >
                              <span className="text-xs opacity-50">
                                {el.title}:
                              </span>
                              <b>
                                {el.value}{" "}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
