import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "./input";
import { SelectInput } from "../select-input";
import { ComparisonFilterValue } from "../../../types/app.logic.types";

interface ComparisonInputProps {
  label: string;
  value?: ComparisonFilterValue;
  onChange: (val?: ComparisonFilterValue) => void;
  currency?: string;
}

export const ComparisonInput = ({
  label,
  value,
  onChange,
  currency,
}: ComparisonInputProps) => {
  const { t } = useTranslation();
  const ops = [
    { label: t("common.op.eq"), value: "=" },
    { label: t("common.op.gte"), value: ">=" },
    { label: t("common.op.lte"), value: "<=" },
    { label: t("common.op.gt"), value: ">" },
    { label: t("common.op.lt"), value: "<" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <div className="w-24">
          <SelectInput
            options={[{ groupTitle: "Op", options: ops }]}
            value={value?.op || "="}
            onValueChange={(op) => onChange({ op, value: value?.value || 0 })}
            placeholder="="
          />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="number"
            value={value?.value || ""}
            onChange={(e) =>
              onChange({
                op: value?.op || "=",
                value: parseFloat(e.target.value) || 0,
              })
            }
          />
          {currency && (
            <span className="text-sm text-gray-400">{currency}</span>
          )}
        </div>
      </div>
    </div>
  );
};
