import { FunctionComponent, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useTranslation } from "react-i18next";

interface BalanceFilters {
  dateFrom?: string;
  dateTo?: string;
  balance_status?: string;
  amount?: { op: string; value: number };
  amount_bc?: { op: string; value: number };
  total_payed?: { op: string; value: number };
  total_payed_bc?: { op: string; value: number };
}

interface BalanceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BalanceFilters;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

const comparisonOps = [
  { label: "=", value: "=" },
  { label: ">", value: ">" },
  { label: "<", value: "<" },
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
];

export const BalanceFilterModal: FunctionComponent<BalanceFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleComparisonChange = (
    field: string,
    key: "op" | "value",
    val: any,
  ) => {
    const current = (filters as any)[field] || { op: "=", value: 0 };
    onFilterChange(field, { ...current, [key]: val });
  };

  const ComparisonInput = ({
    field,
    label,
  }: {
    field: string;
    label: string;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <div className="w-24">
          <SelectInput
            value={(filters as any)[field]?.op || "="}
            onValueChange={(val) => handleComparisonChange(field, "op", val)}
            options={[{ groupTitle: "Operators", options: comparisonOps }]}
            placeholder="="
          />
        </div>
        <Input
          type="number"
          value={(filters as any)[field]?.value ?? ""}
          onChange={(e) =>
            handleComparisonChange(field, "value", Number(e.target.value))
          }
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <Modal onClose={onClose} title={t("balances.filter_modal.title")}>
      <div className="grid gap-4 py-4">
        <p className="text-sm text-gray-400 mb-2">
          {t("balances.filter_modal.description")}
        </p>

        {/* Helper Date Inputs within Modal if needed, usually handled by main page but good for custom ranges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              {t("common.date_from")}
            </label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t("common.date_to")}</label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => onFilterChange("dateTo", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            {t("balances.columns.status")}
          </label>
          <SelectInput
            value={filters.balance_status || "ALL"}
            onValueChange={(val) => onFilterChange("balance_status", val)}
            options={[
              {
                groupTitle: t("balances.columns.status"),
                options: [
                  { label: t("common.all"), value: "ALL" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Partial", value: "PARTIAL" },
                  { label: "Paid", value: "PAID" },
                  { label: "Overdue", value: "OVERDUE" },
                ],
              },
            ]}
            placeholder={t("common.select_status")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComparisonInput
            field="amount"
            label={t("balances.columns.amount")}
          />
          <ComparisonInput
            field="amount_bc"
            label={t("balances.columns.amount_bc")}
          />
          <ComparisonInput
            field="total_payed"
            label={t("balances.columns.total_payed")}
          />
          <ComparisonInput
            field="total_payed_bc"
            label={t("balances.columns.total_payed_bc")}
          />
        </div>

        <div className="flex justify-end gap-2 w-full mt-4">
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            {t("common.clear_all")}
          </Button>
          <Button onClick={onClose}>{t("common.apply_filters")}</Button>
        </div>
      </div>
    </Modal>
  );
};
