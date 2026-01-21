import { FormEvent, FunctionComponent, useState } from "react";
import {
  BranchRate,
  CurrencyEnum,
  Spending__ValidationSchema,
  SpendingCategoryType_Zod,
  SpendingType_Zod,
  SpendingTypeEnum,
} from "../../../types/app.logic.types";
import { getNumber, isNumber, numberReadFormat } from "../../utils";
import { Modal } from "../../components/ui/modal";
import { Input } from "../../components/ui/input";
import { Combobox } from "../../components/ui/combo-box";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { currencyConversion } from "../../components/sale-form/rate-convertion";

export const RecordSpendingFormModal: FunctionComponent<{
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  //   const { status, session } = useAuth();
  //   const { branch, userId } = useUserContext();
  //   const haveAccess = userHaveAccess(AccessCodes.SpendingCreate, branch);

  //   const t = useTranslations("spending");
  const t = (e: string) => e;

  const branchRate: BranchRate = {
    CDF: 148,
    RWF: 123,
  };

  const [rateCDF, setRateCDF] = useState<number>(branchRate.CDF || 0);
  const [rateRWF, setRateRWF] = useState<number>(branchRate.RWF || 0);
  const [payedUSD, setPayedUSD] = useState("0");
  const [payedCDF, setPayedCDF] = useState("0");
  const [payedRWF, setPayedRWF] = useState("0");
  const [errors, setErrors] = useState<
    { target: keyof SpendingType_Zod; message: string }[]
  >([]);

  const [spendingCategoryId, setSpendingCategoryId] = useState("");
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");

  const isPendingCategories = false;
  const spendingCategories: SpendingCategoryType_Zod[] = [];
  const categoryError = false;
  // const {
  //   data: spendingCategories,
  //   isLoading: isPendingCategories,
  //   isError: categoryError,
  // } = useQuery({
  //   queryKey: ["spending-categories"],
  //   queryFn: () => getSpendingCategories_action(),
  //   refetchOnWindowFocus: false,
  //   enabled: status !== "loading" && haveAccess,
  // });

  const isPending = false;

  // // useMutation
  // const { mutate: server_RecordSpending, isPending } = useMutation({
  //   mutationFn: createSpending_action,
  //   onSuccess: () => {
  //     toast.success(t("record-spending-success"));
  //     onSuccess?.();
  //     onClose();
  //   },
  //   onError: (error) => {
  //     toast.error(t("failed-msg"));
  //     console.error(error);
  //   },
  // });

  const getError = (target: keyof SpendingType_Zod): string | undefined =>
    errors.find((err) => err.target === target)?.message;

  const branchCurrency: CurrencyEnum = CurrencyEnum.CDF;
  const branchName = "Testing branch";

  const totalPayed_RWF_to_BalanceCurrency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.RWF,
    branchCurrency,
    getNumber(payedRWF),
  );

  const totalPayed_CDF_to_BalanceCurrency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.CDF,
    branchCurrency,
    getNumber(payedCDF),
  );

  const totalPayed_USD_to_BalanceCurrency = currencyConversion(
    {
      RWF: rateRWF,
      CDF: rateCDF,
    },
    CurrencyEnum.USD,
    branchCurrency as CurrencyEnum,
    getNumber(payedUSD),
  );

  const totalPayedRaw =
    totalPayed_RWF_to_BalanceCurrency +
    totalPayed_CDF_to_BalanceCurrency +
    totalPayed_USD_to_BalanceCurrency;

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors([]);

    if (
      getNumber(payedCDF) <= 0 &&
      getNumber(payedRWF) <= 0 &&
      getNumber(payedUSD) <= 0
    ) {
      setErrors([
        { target: "cash_CDF", message: t("amount-required") },
        { target: "cash_RWF", message: t("amount-required") },
        { target: "cash_USD", message: t("amount-required") },
      ]);

      return;
    }

    const dataSubmit: SpendingType_Zod = {
      id: "uuidv4()",
      branch_id: "branch?.branch?.id!",
      created_date: new Date(),
      comment,
      title,
      active: true,
      approved: false,
      branch_currency: branchCurrency,
      cash_CDF: getNumber(payedCDF),
      cash_RWF: getNumber(payedRWF),
      cash_USD: getNumber(payedUSD),
      rate_CDF: getNumber(rateCDF),
      rate_RWF: getNumber(rateRWF),
      recorded_by: "userId!",
      spending_category_id: spendingCategoryId,
      total_bc: getNumber(totalPayedRaw),
      spending_type: SpendingTypeEnum.SPENDING,
      history: JSON.stringify([]),
      updated_date: new Date(),
      row_version: 1,
      app_connection: null,
      row_deleted: null,
    };

    const validation = Spending__ValidationSchema.safeParse(dataSubmit);
    if (!validation.success) {
      setErrors(
        validation.error.issues.map((issue) => ({
          target: issue.path[0] as keyof SpendingType_Zod,
          message: issue.message,
        })),
      );
      return;
    }

    // server_RecordSpending(dataSubmit);
    console.log("Submitted data:", dataSubmit);
  };

  // if (!branch)
  //   return <Modal onBackdropClose={onClose}>{t("no-selected-branch")}</Modal>;

  // if (status === "loading") return <LoadingPage />;
  // if (!haveAccess) return <NoAccessPage />;

  return (
    <Modal
      title={t("record-spending")}
      noSpacing
      headerSpacing
      onClose={onClose}
    >
      <form onSubmit={onSubmitHandler}>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <Input
            label={t("title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            error={getError("title")}
          />

          <div className="flex flex-col lg:flex-row gap-3">
            <Combobox
              label={t("spending-category")}
              value={spendingCategoryId}
              onChange={setSpendingCategoryId}
              options={
                spendingCategories?.map((el) => ({
                  label: el.name || "",
                  value: el.id,
                })) || []
              }
              disabled={isPending || isPendingCategories}
              error={
                categoryError
                  ? t("failed-categories")
                  : getError("spending_category_id")
              }
            />

            <Input
              label={t("branch-currency")}
              value={branchCurrency}
              disabled
            />
          </div>

          {true && (
            <div className="flex flex-col items-center lg:flex-row gap-3 border-t mt-2 border-color-theme pt-2">
              <div className="flex-1">
                <h4 className="text-base-color">{t("rate")}</h4>
              </div>

              <div className="flex flex-row gap-3">
                <Input
                  value={rateRWF}
                  onChange={(e) => setRateRWF(+e.target.value)}
                  label={t("rate-RWF")}
                  inputSize="sm"
                  disabled={isPending}
                  error={getError("rate_RWF")}
                />
                <Input
                  value={rateCDF}
                  onChange={(e) => setRateCDF(+e.target.value)}
                  label={t("rate-CDF")}
                  inputSize="sm"
                  disabled={isPending}
                  error={getError("rate_CDF")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-300/5 border-y border-color-theme p-2 px-4">
          <div className="pb-3 content-between">
            <div>
              <span className="text-base-color text-sm">
                {t("total-b-currency")}
              </span>
              <h2 className="text-3xl">
                {numberReadFormat(totalPayedRaw)}{" "}
                <span className="text-sm">{branchCurrency}</span>
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-3 content-between border-t border-color-theme py-2 ">
            <Input
              value={payedUSD}
              onChange={(e) => setPayedUSD(e.target.value)}
              label={`${t("cash-in-hand")} ${CurrencyEnum.USD}`}
              inputSize="lg"
              error={!isNumber(payedUSD) ? "Invalid" : getError("cash_USD")}
              disabled={isPending}
            />
            <Input
              value={payedRWF}
              onChange={(e) => setPayedRWF(e.target.value)}
              label={`${t("cash-in-hand")} ${CurrencyEnum.RWF}`}
              inputSize="lg"
              error={!isNumber(payedRWF) ? "Invalid" : getError("cash_RWF")}
              disabled={isPending}
            />
            <Input
              value={payedCDF}
              onChange={(e) => setPayedCDF(e.target.value)}
              label={`${t("cash-in-hand")} ${CurrencyEnum.CDF}`}
              inputSize="lg"
              error={!isNumber(payedCDF) ? "Invalid" : getError("cash_CDF")}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4- pt-4">
          <Textarea
            label={t("comment")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
            error={getError("comment")}
          />
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4 pt-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <Input value={branchName} label={t("branch-name")} disabled />
            <Input
              value={"You"}
              // TODO: add name
              label={t("recorded-by")}
              disabled
            />
          </div>
        </div>

        <div className="p-3 justify-end flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={isPending}
          >
            {t("cancel")}
          </Button>

          <Button variant="primary" loading={isPending}>
            {t("record-spending")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
