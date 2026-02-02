import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SpendingTypeEnum, CurrencyEnum } from "../../../types/app.logic.types";
import { authStore } from "../../../store/auth";
import { SelectInput } from "../../components/select-input";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { currencyConversion } from "../../components/sale-form/rate-convertion";
import { Badge } from "../../components/ui/badge";
import { getNumber } from "../../utils/client-utils";

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateExpenseModalProps) => {
  const { t } = useTranslation();
  const { account, branch } = authStore();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [spendingType, setSpendingType] = useState<SpendingTypeEnum>(
    SpendingTypeEnum.SPENDING,
  );
  const [currency, setCurrency] = useState<CurrencyEnum>(CurrencyEnum.USD);
  const [amountUSD, setAmountUSD] = useState("");
  const [amountCDF, setAmountCDF] = useState("");
  const [amountRWF, setAmountRWF] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["spending-categories"],
    queryFn: async () => {
      if (window.electronAPI?.getSpendingCategories) {
        return await window.electronAPI.getSpendingCategories();
      }
      return [];
    },
  });

  const numAmountUSD = getNumber(amountUSD || "0");
  const numAmountCDF = getNumber(amountCDF || "0");
  const numAmountRWF = getNumber(amountRWF || "0");

  const totalBC = useMemo(() => {
    if (!branch?.rate_in?.CDF || !branch?.rate_in?.RWF) return 0;

    const total_USD_to_BC = currencyConversion(
      {
        CDF: branch?.rate_in?.CDF,
        RWF: branch?.rate_in?.RWF,
      },
      CurrencyEnum.USD!,
      branch?.branch_currency as CurrencyEnum,
      numAmountUSD,
    );

    const total_CDF_to_BC = currencyConversion(
      {
        CDF: branch?.rate_in?.CDF,
        RWF: branch?.rate_in?.RWF,
      },
      CurrencyEnum.CDF!,
      branch?.branch_currency as CurrencyEnum,
      numAmountCDF,
    );

    const total_RWF_to_BC = currencyConversion(
      {
        CDF: branch?.rate_in?.CDF,
        RWF: branch?.rate_in?.RWF,
      },
      CurrencyEnum.RWF!,
      branch?.branch_currency as CurrencyEnum,
      numAmountRWF,
    );

    return getNumber(total_USD_to_BC + total_CDF_to_BC + total_RWF_to_BC);
  }, [amountUSD, amountCDF, amountRWF]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCategoryId("");
      setSpendingType(SpendingTypeEnum.SPENDING);
      setCurrency(CurrencyEnum.USD);
      setAmountUSD("");
      setAmountCDF("");
      setAmountRWF("");
      setComment("");
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title || title.length < 4)
      newErrors.title = t("expenses.create_modal.title_length_error");
    if (!categoryId)
      newErrors.categoryId = t("expenses.create_modal.category_required");
    if (
      !numAmountUSD ||
      isNaN(Number(numAmountUSD)) ||
      Number(numAmountUSD) < 0
    )
      newErrors.amountUSD = t("expenses.create_modal.amount_positive_error");

    if (
      !numAmountCDF ||
      isNaN(Number(numAmountCDF)) ||
      Number(numAmountCDF) < 0
    )
      newErrors.amountCDF = t("expenses.create_modal.amount_positive_error");

    if (
      !numAmountRWF ||
      isNaN(Number(numAmountRWF)) ||
      Number(numAmountRWF) < 0
    )
      newErrors.amountRWF = t("expenses.create_modal.amount_positive_error");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!branch) {
      toast.error(t("expenses.create_modal.no_connection_info"));
      return;
    }

    const expenseData = {
      id: uuidv4(),
      title,
      spending_category_id: categoryId,
      spending_type: spendingType,
      branch_currency: currency,
      cash_USD: numAmountUSD,
      cash_CDF: numAmountCDF,
      cash_RWF: numAmountRWF,
      total_bc: totalBC,
      branch_id: branch.id,
      recorded_by: account?.user_id,
      comment: comment || "",
      approved: false,
      active: true,
    };

    try {
      await window.electronAPI.createExpense(expenseData);
      onSuccess();
      toast.success(t("expenses.create_modal.create_success"));
      onClose();
    } catch (error) {
      toast.error(t("expenses.create_modal.create_failure"));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={t("expenses.create_new", "Create New Expense")}
      onClose={onClose}
      size="default"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("common.title")}</label>
          <Input
            placeholder={t("expenses.create_modal.expense_title_placeholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("common.category")}</label>
          <SelectInput
            options={[
              {
                options: categories.map((c: any) => ({
                  label: c.name,
                  value: c.id,
                })),
              },
            ]}
            placeholder={t("common.select_category")}
            value={categoryId}
            onValueChange={setCategoryId}
            error={errors.categoryId}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.type")}</label>

            <SelectInput
              options={[
                {
                  groupTitle: "Spending",
                  options: Object.values(SpendingTypeEnum).map((type) => ({
                    label: type,
                    value: type,
                  })),
                },
              ]}
              placeholder={""}
              value={spendingType}
              onValueChange={(val) => setSpendingType(val as SpendingTypeEnum)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("common.currency")}
            </label>
            <SelectInput
              options={[
                {
                  options: Object.values(CurrencyEnum).map((curr) => ({
                    label: curr,
                    value: curr,
                  })),
                },
              ]}
              placeholder={t(
                "expenses.create_modal.select_currency_placeholder",
              )}
              value={currency}
              onValueChange={(val) => setCurrency(val as CurrencyEnum)}
            />
          </div>
        </div>

        <div className="space-y-2 grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">
              {t("common.amount_usd")}
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              error={errors.amountUSD}
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("common.amount_cdf")}
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountCDF}
              onChange={(e) => setAmountCDF(e.target.value)}
              error={errors.amountCDF}
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              {t("common.amount_rwf")}
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountRWF}
              onChange={(e) => setAmountRWF(e.target.value)}
              error={errors.amountRWF}
            />
          </div>
        </div>

        <div className="flex border border-gray-400 rounded p-2 gap-2 justify-between items-center">
          <div>
            <label className="text-sm font-medium">
              {t("expenses.create_modal.total_bc")}
            </label>
            <Input type="number" placeholder="0.00" value={totalBC} disabled />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm">
              branch Currency: <Badge>{branch?.branch_currency}</Badge>
            </span>
            <div className="flex gap-4">
              <span>
                CDF: <Badge variant="purple">{branch?.rate_in?.CDF}</Badge>
              </span>
              <span>
                RWF: <Badge variant="purple">{branch?.rate_in?.RWF}</Badge>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("common.comment")}</label>
          <Input
            placeholder={t("expenses.create_modal.comment_placeholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
