import React from "react";
import { useTranslation } from "react-i18next";
import { SideModal } from "../../../components/ui/side-modal";
import { SelectInput } from "../../../components/select-input";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ComparisonInput } from "../../../components/ui/comparison-input";
import { ProductFilters } from "../../../../types/app.logic.types";

interface ProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFilterChange: (key: keyof ProductFilters, value: any) => void;
  onClearFilters: () => void;
  categories: any[];
}

export const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  categories,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <SideModal
      title={t("products.filters.title")}
      onClose={onClose}
      backdrop
      disableClose={false}
      size="sm"
    >
      <div className="flex flex-col gap-4 text-white p-4">
        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("products.filters.category")}
          </label>
          <SelectInput
            options={[
              {
                groupTitle: t("products.filters.category"),
                options: [
                  { label: t("products.filters.all"), value: "all" },
                  ...categories.map((c) => ({
                    label: c.name,
                    value: c.id,
                  })),
                ],
              },
            ]}
            value={filters.category_id || "all"}
            onValueChange={(val) =>
              onFilterChange("category_id", val === "all" ? "" : val)
            }
            placeholder={t("products.filters.select_category")}
          />
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("products.filters.colors_label")}
          </label>
          <Input
            value={filters.colors || ""}
            onChange={(e) => onFilterChange("colors", e.target.value)}
            placeholder={t("products.filters.colors_placeholder")}
          />
        </div>

        {/* Booleans */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_printable"
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={filters.is_printable === true}
              onChange={(e) =>
                onFilterChange(
                  "is_printable",
                  e.target.checked ? true : undefined,
                )
              }
            />
            <label htmlFor="is_printable" className="text-sm font-medium">
              {t("products.filters.printable")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="custom_divers"
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={filters.custom_divers === true}
              onChange={(e) =>
                onFilterChange(
                  "custom_divers",
                  e.target.checked ? true : undefined,
                )
              }
            />
            <label htmlFor="custom_divers" className="text-sm font-medium">
              {t("products.filters.custom_divers")}
            </label>
          </div>
        </div>

        {/* Comparisons */}
        <ComparisonInput
          label={t("products.filters.stock_quantity")}
          value={filters.stock_quantity}
          onChange={(v) => onFilterChange("stock_quantity", v)}
        />

        <ComparisonInput
          label={t("products.filters.price_usd")}
          value={filters.price_USD}
          onChange={(v) => onFilterChange("price_USD", v)}
          currency="$"
        />

        <ComparisonInput
          label={t("products.filters.price_cdf")}
          value={filters.price_CDF}
          onChange={(v) => onFilterChange("price_CDF", v)}
          currency="FC"
        />

        <ComparisonInput
          label={t("products.filters.price_rwf")}
          value={filters.price_RWF}
          onChange={(v) => onFilterChange("price_RWF", v)}
          currency="RWF"
        />

        <div className="flex justify-end pt-4">
          <Button onClick={onClearFilters} variant="ghost">
            {t("products.filters.clear")}
          </Button>
          <Button onClick={onClose}>{t("products.filters.done")}</Button>
        </div>
      </div>
    </SideModal>
  );
};
