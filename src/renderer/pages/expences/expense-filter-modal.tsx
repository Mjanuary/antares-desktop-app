import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { SelectInput } from "../../components/select-input";
import { Input } from "../../components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface ExpensesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export const ExpensesFilterModal = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}: ExpensesFilterModalProps) => {
  const { t } = useTranslation();

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["spending-categories"],
    queryFn: async () => {
      if (window.electronAPI?.getSpendingCategories) {
        return await window.electronAPI.getSpendingCategories();
      }
      return [];
    },
  });

  const categoryOptions = categories.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));

  if (!isOpen) return null;

  return (
    <Modal title={t("common.filter_options")} onClose={onClose} size="sm">
      <div className="grid gap-4 py-4 min-w-[400px]">
        {/* Category Filter */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="text-right text-sm">{t("common.category")}</span>
          <div className="col-span-3">
            <SelectInput
              options={[{ groupTitle: "Categories", options: categoryOptions }]}
              value={filters.spending_category_id || ""}
              onValueChange={(val) =>
                onFilterChange("spending_category_id", val)
              }
              placeholder={t("common.select_category")}
              title={t("common.category")}
              classNameParent="w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="text-right text-sm">{t("common.status")}</span>
          <div className="col-span-3">
            <SelectInput
              options={[
                {
                  groupTitle: "Status",
                  options: [
                    { label: t("common.active"), value: "active" }, // maybe not needed
                    { label: t("common.approved"), value: "APPROVED" },
                    { label: t("common.pending"), value: "PENDING" },
                  ],
                },
              ]}
              value={filters.status || ""}
              onValueChange={(val) => onFilterChange("status", val)}
              placeholder={t("common.select_status")}
              title={t("common.status")}
              classNameParent="w-full"
            />
          </div>
        </div>

        {/* Amount Filter */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="text-right text-sm">{t("common.amount")}</span>
          <div className="col-span-3 flex gap-2">
            <SelectInput
              options={[
                {
                  groupTitle: "Op",
                  options: [
                    { label: "=", value: "=" },
                    { label: ">", value: ">" },
                    { label: "<", value: "<" },
                  ],
                },
              ]}
              value={filters.amount?.op || "="}
              onValueChange={(val) =>
                onFilterChange("amount", { ...filters.amount, op: val })
              }
              placeholder="Op"
              title="Op"
              classNameParent="w-[70px]"
            />
            <Input
              type="number"
              placeholder="0.00"
              value={filters.amount?.value || ""}
              onChange={(e) =>
                onFilterChange("amount", {
                  ...filters.amount,
                  value: Number(e.target.value),
                  op: filters.amount?.op || "=",
                })
              }
              className="flex-1 bg-zinc-900 border-zinc-700"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClearFilters}>
          {t("common.clear")}
        </Button>
        <Button onClick={onClose}>{t("common.apply")}</Button>
      </div>
    </Modal>
  );
};
