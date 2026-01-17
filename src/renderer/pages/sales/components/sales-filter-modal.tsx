import React from "react";
import { useTranslation } from "react-i18next";
import { SideModal } from "../../../components/ui/side-modal";
import { SelectInput } from "../../../components/select-input";
import { Button } from "../../../components/ui/button";
import { ComparisonInput } from "../../../components/ui/comparison-input";

// Define locally for now to avoid circular deps or just for speed,
// ensuring it matches what's in sales.tsx
interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  payment_currency?: string;
  client_id?: string;
  house_id?: string;
  price_total?: { op: string; value: number };
  price_total_bc?: { op: string; value: number };
  total_payed_cash?: { op: string; value: number };
  total_payed_cash_bc?: { op: string; value: number };
  balance?: { op: string; value: number };
  balance_bc?: { op: string; value: number };
  total_products?: { op: string; value: number };
  payed_USD?: { op: string; value: number };
  payed_CDF?: { op: string; value: number };
  payed_RWF?: { op: string; value: number };
}

interface SalesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SaleFilters;
  clients: any[];
  houses: any[];
  onFilterChange: (key: keyof SaleFilters, value: any) => void;
  onClearFilters: () => void;
}

export const SalesFilterModal: React.FC<SalesFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  clients,
  houses,
  onFilterChange,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <SideModal
      title={t("sales.filters.title") || "Filter Sales"}
      onClose={onClose}
      backdrop
      disableClose={false}
      size="sm"
    >
      <div className="flex flex-col gap-4 text-white p-4">
        {/* Payment Currency */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Payment Currency</label>
          <SelectInput
            options={[
              {
                groupTitle: "Currency",
                options: [
                  { label: "All", value: "all" },
                  { label: "USD", value: "USD" },
                  { label: "CDF", value: "CDF" },
                  { label: "RWF", value: "RWF" },
                ],
              },
            ]}
            value={filters.payment_currency || "all"}
            onValueChange={(val) =>
              onFilterChange(
                "payment_currency",
                val === "all" ? undefined : val,
              )
            }
            placeholder="Select Currency"
          />
        </div>

        {/* Client & House */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Client</label>
          <SelectInput
            options={[
              {
                groupTitle: "Clients",
                options: [
                  { label: "All Clients", value: "all" },
                  ...clients.map((c) => ({
                    label: c.names || c.name || "Unknown",
                    value: c.id,
                  })),
                ],
              },
            ]}
            value={filters.client_id || "all"}
            onValueChange={(val) =>
              onFilterChange("client_id", val === "all" ? undefined : val)
            }
            placeholder="Select Client"
            inputVariant="default"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">House</label>
          <SelectInput
            options={[
              {
                groupTitle: "Houses",
                options: [
                  { label: "All Houses", value: "all" },
                  ...houses.map((h) => ({ label: h.name, value: h.id })),
                ],
              },
            ]}
            value={filters.house_id || "all"}
            onValueChange={(val) =>
              onFilterChange("house_id", val === "all" ? undefined : val)
            }
            placeholder="Select House"
            inputVariant="default"
          />
        </div>

        {/* Comparisons */}
        <ComparisonInput
          label={t("sales.columns.total")}
          value={filters.price_total}
          onChange={(v) => onFilterChange("price_total", v)}
        />

        <ComparisonInput
          label="Total Balance"
          value={filters.balance}
          onChange={(v) => onFilterChange("balance", v)}
        />

        <ComparisonInput
          label="Items Count"
          value={filters.total_products}
          onChange={(v) => onFilterChange("total_products", v)}
        />

        <ComparisonInput
          label="Paid USD"
          value={filters.payed_USD}
          onChange={(v) => onFilterChange("payed_USD", v)}
          currency="$"
        />

        <ComparisonInput
          label="Paid CDF"
          value={filters.payed_CDF}
          onChange={(v) => onFilterChange("payed_CDF", v)}
          currency="FC"
        />

        <ComparisonInput
          label="Paid RWF"
          value={filters.payed_RWF}
          onChange={(v) => onFilterChange("payed_RWF", v)}
          currency="RWF"
        />

        <div className="flex justify-end pt-4">
          <Button onClick={onClearFilters} variant="ghost">
            {t("common.table.clear_filters")}
          </Button>
          <Button onClick={onClose}>
            {t("common.filters.done") || "Done"}
          </Button>
        </div>
      </div>
    </SideModal>
  );
};
