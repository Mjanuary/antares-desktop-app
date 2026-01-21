// import { getInvitationSaleByParentIdList } from "@/actions/invitation";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { MdCalendarMonth, MdAccessTimeFilled } from "react-icons/md";
import { dateFormat, numberReadFormat, timeFormat } from "../../utils";
import { Button } from "../ui/button";

export const InvitationSalesHistory: FunctionComponent<{
  parentId: string;
  saleId: string;
}> = ({ parentId, saleId }) => {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["invitation-sales-parent-list", parentId],
  //   queryFn: () => getInvitationSaleByParentIdList(parentId),
  //   enabled: !!parentId,
  //   refetchOnWindowFocus: false,
  // });
  const data: any[] = []; // Placeholder for fetched data
  const isLoading = false; // Placeholder for loading state

  // const t = useTranslations("sales-history");
  const t = (key: string) => key; // Placeholder for translation function

  return (
    <div className="px-2 flex flex-col gap-2 pt-2">
      <div className="flex justify-between bg-color-overlay-theme p-2 rounded-lg items-center pr-4">
        <h2 className="text-center">{t("title")}</h2>
        <span>{data?.length || "--"}</span>
      </div>
      {isLoading && (
        <>
          <div className="h-[200px] rounded-lg bg-app-gray-animated text-transparent opacity-30" />
          <div className="h-[200px] rounded-lg bg-app-gray-animated text-transparent opacity-30" />
        </>
      )}

      {!data ||
        (data.length <= 0 && (
          <div className="py-8 text-center opacity-50">
            <p>{t("no-sales-title")}</p>
          </div>
        ))}
      {data &&
        data.map((el) => {
          const isCurrent = saleId == el.id;
          return (
            <div
              key={el.id}
              className={classNames(
                "border border-color-theme p-2 rounded-lg",
                {
                  "!border-primary-200": isCurrent,
                },
              )}
            >
              <div className="flex justify-between">
                <div className="flex flex-col lg:flex-row lg:gap-4">
                  <div className="flex items-center gap-1">
                    <MdCalendarMonth className="opacity-80" />
                    <span>{dateFormat(el.created_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdAccessTimeFilled className="opacity-60" />
                    <span>{timeFormat(el.created_time)}</span>
                  </div>
                </div>

                {!isCurrent && (
                  // <AppLink href={`/invitation-sales/${el.id}?history=true`}>
                  <Button size="sm" variant="primary-light">
                    {t("open")}
                  </Button>
                  // </AppLink>
                )}
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 pt-2">
                <div className="border rounded-lg p-0.5 px-2 bg-gray-100/20 dark:bg-gray-400/20 border-color-theme">
                  <span className="text-xs opacity-50">{t("q")}</span>
                  <h2 className="text-lg -mt-1">
                    {numberReadFormat(el.quantity)}
                  </h2>
                </div>

                <div className="border rounded-lg p-0.5 px-2 bg-gray-100/20 dark:bg-gray-400/20 border-color-theme">
                  <span className="text-xs opacity-50">{t("pu")}</span>
                  <h2 className="text-lg -mt-1 whitespace-nowrap">
                    {numberReadFormat(el.price_unit)}{" "}
                    <span className="text-xs text-green-600">
                      {el.payment_currency}
                    </span>
                  </h2>
                </div>

                <div className="border rounded-lg p-0.5 px-2 bg-gray-100/20 dark:bg-gray-400/20 border-color-theme">
                  <span className="text-xs opacity-50">{t("bon")}</span>
                  <h2 className="text-lg -mt-1">
                    {numberReadFormat(el.bonus || 0)}
                  </h2>
                </div>
              </div>

              <div className="border rounded-lg mt-2 p-0.5 px-2 flex flex-col gap-0 py-2 bg-gray-100/20 dark:bg-gray-400/20 border-color-theme">
                <span className="text-xs opacity-50">{t("pt")}</span>
                <h2 className="text-lg  whitespace-nowrap">
                  {numberReadFormat(el.price_total)}{" "}
                  <span className="text-xs text-green-600">
                    {el.payment_currency}
                  </span>
                </h2>
                <span className="text-xs ">
                  {t("bc")}:{" "}
                  <b className="text-yellow-600">
                    {numberReadFormat(el.price_total_bc)}{" "}
                    <span className="text-xs font-extralight">
                      {el.branch_currency}
                    </span>
                  </b>
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};
