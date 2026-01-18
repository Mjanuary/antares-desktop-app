import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/modal";
import { Button } from "../../components/ui/button";
import { SelectInput } from "../../components/select-input";
import { Input } from "../../components/ui/input";

interface DepositFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export const DepositFilterModal = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}: DepositFilterModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal title={t("common.filter_options")} onClose={onClose} size="sm">
      <div className="grid gap-4 py-4 min-w-[400px]">
        {/* Status Filter (Decision) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="text-right text-sm">{t("common.status")}</span>
          <div className="col-span-3">
            <SelectInput
              options={[
                {
                  groupTitle: t("common.status"),
                  options: [
                    { label: t("common.approved"), value: "APPROVED" },
                    { label: t("common.pending"), value: "PENDING" },
                    { label: t("common.rejected"), value: "REJECTED" },
                  ],
                },
              ]}
              value={filters.decision || ""}
              onValueChange={(val: string) => onFilterChange("decision", val)}
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
              onValueChange={(val: string) =>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
