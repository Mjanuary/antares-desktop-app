import classNames from "classnames";
import { FunctionComponent } from "react";
import { BalanceType } from "../../../types/app.logic.types";
import { dateFormat, getNumber, numberReadFormat } from "../../utils";

export const SaleBalanceCard: FunctionComponent<{
  balance: BalanceType;
}> = ({ balance }) => {
  // const t = useTranslations("balance");
  const t = (key: string) => key; // Placeholder for translation function

  return (
    <div>
      <span className="text-base-color opacity-50 font-bold uppercase text-xs">
        {t("balance")}
      </span>

      <div
        className={classNames("border rounded-lg items-center gap-3 lg:gap-0", {
          "border-yellow-500/50 bg-yellow-500/5":
            balance.balance_status !== "COMPLETED",
          "border-green-500/50 bg-green-500/5":
            balance.balance_status === "COMPLETED",
        })}
      >
        <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 px-4"}>
          {[
            {
              title: t("balance-amount"),
              value: balance.amount,
              currency: balance.payment_currency,
              bc: balance.amount_bc,
              bc_currency: balance.branch_currency,
            },
            {
              title: t("payed-cash"),
              value: balance.payed_amount,
              currency: balance.payment_currency,
              bc: balance.payed_amount_bc,
              bc_currency: balance.branch_currency,
            },
            {
              title: t("remaining-balance"),
              value:
                getNumber(balance.payed_amount) - getNumber(balance.amount),
              currency: balance.payment_currency,
              bc:
                getNumber(balance.payed_amount_bc) -
                getNumber(balance.amount_bc),
              bc_currency: balance.branch_currency,
            },
          ].map(({ bc, bc_currency, currency, title, value }, key) => (
            <div
              key={key}
              className={classNames("p-2 ", {
                "border-yellow-500/50": balance.balance_status !== "COMPLETED",
                "border-green-500/50": balance.balance_status === "COMPLETED",
                "border-b  xl:border-b-transparent xl:border-r border-dashed":
                  key <= 1,
              })}
            >
              <h5 className="text-sm">{title}</h5>

              <h2 className="text-xl">
                {numberReadFormat(value)}{" "}
                <span className="text-sm">{currency}</span>
              </h2>
              <h5 className="text-xs">
                <span className="opacity-50">{t("branch-currency")}:</span>{" "}
                <b>{numberReadFormat(bc)}</b>
                <span>{bc_currency}</span>
              </h5>
            </div>
          ))}
        </div>
        <div
          className={classNames(
            "px-3 py-2 text-sm lg:gap-1 border-t border-yellow-500/50 border-dashed grid grid-cols-2 gap-3 lg:grid-cols-3",
            {
              "border-yellow-500/50": balance.balance_status !== "COMPLETED",
              "border-green-500/50": balance.balance_status === "COMPLETED",
            },
          )}
        >
          <div className="items-center lg:gap-1 flex-col flex">
            <span className="text-xs opacity-80">{t("balance-status")}:</span>
            <b>{balance.balance_status}</b>{" "}
          </div>
          <div className="items-center lg:gap-1 flex-col flex">
            <span className="text-xs opacity-80">{t("pay-date")}:</span>
            <b>{dateFormat(balance.pay_date)}</b>{" "}
          </div>
          <div className="items-center lg:gap-1 flex-col flex">
            <span className="text-xs opacity-80">{t("create-balance")}:</span>
            <b>{dateFormat(balance.created_date)}</b>{" "}
          </div>
        </div>
      </div>
    </div>
  );
};
