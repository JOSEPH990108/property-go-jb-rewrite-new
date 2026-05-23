"use client";

import type { SalesPackageRow, DropdownOptions } from "@/app/actions/project-setup-actions";
import {
  DynamicRows,
  FieldInput,
  FieldSelect,
  FieldSwitch,
  SectionHeading,
} from "./WizardComponents";

type Props = {
  rows: SalesPackageRow[];
  onChange: (rows: SalesPackageRow[]) => void;
  options: DropdownOptions;
};

const emptyPackage = (): SalesPackageRow => ({
  name: "",
  buyerTypeId: "",
  rebatePercentage: "",
  cashBackAmount: "",
  validFrom: "",
  validTo: "",
  isActive: true,
});

export function Step6SalesPackages({ rows, onChange, options }: Props) {
  const update = (i: number, field: keyof SalesPackageRow, value: string | boolean) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  return (
    <div>
      <SectionHeading
        title="Sales Packages"
        subtitle="Rebates, free gifts, and promotions for this project."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, emptyPackage()])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Sales Package"
      >
        {(row, i) => (
          <div className="space-y-4 pr-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <FieldInput
                  label="Package Name"
                  required
                  value={row.name}
                  onChange={(v) => update(i, "name", v)}
                  placeholder="e.g. SPA Rebate 13%"
                />
              </div>
              <FieldSelect
                label="Buyer Type"
                value={row.buyerTypeId}
                onChange={(v) => update(i, "buyerTypeId", v)}
                options={options.buyerTypes}
              />
              <FieldSwitch
                label="Active"
                checked={row.isActive}
                onChange={(v) => update(i, "isActive", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FieldInput
                label="Rebate (%)"
                value={row.rebatePercentage}
                onChange={(v) => update(i, "rebatePercentage", v)}
                placeholder="e.g. 13.00"
                type="number"
              />
              <FieldInput
                label="Cash Back (RM)"
                value={row.cashBackAmount}
                onChange={(v) => update(i, "cashBackAmount", v)}
                placeholder="e.g. 5000"
                type="number"
              />
              <FieldInput
                label="Valid From"
                value={row.validFrom}
                onChange={(v) => update(i, "validFrom", v)}
                type="date"
              />
              <FieldInput
                label="Valid To"
                value={row.validTo}
                onChange={(v) => update(i, "validTo", v)}
                type="date"
              />
            </div>
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
