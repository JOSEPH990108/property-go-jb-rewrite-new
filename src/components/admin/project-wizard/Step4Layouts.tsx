"use client";

import type { LayoutRow } from "@/app/actions/project-setup-actions";
import {
  DynamicRows,
  FieldInput,
  FieldSelect,
  FieldSwitch,
  SectionHeading,
} from "./WizardComponents";

type Props = {
  rows: LayoutRow[];
  onChange: (rows: LayoutRow[]) => void;
};

const FURNISHING_OPTIONS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "PARTIAL_FURNISHED", label: "Partial Furnished" },
  { value: "SEMI_FURNISHED", label: "Semi Furnished" },
  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
];

const emptyLayout = (): LayoutRow => ({
  code: "",
  name: "",
  bedrooms: "1",
  bathrooms: "1",
  builtUpSqft: "",
  studyRooms: "0",
  hasBalcony: false,
  hasYard: false,
  isDualKey: false,
  ceilingHeightM: "",
  furnishingStatus: "UNFURNISHED",
});

export function Step4Layouts({ rows, onChange }: Props) {
  const update = (i: number, field: keyof LayoutRow, value: string | boolean) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  return (
    <div>
      <SectionHeading
        title="Unit Layouts"
        subtitle="Define each unit type. These layout codes are referenced when importing units later."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, emptyLayout()])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Layout"
      >
        {(row, i) => (
          <div className="space-y-4 pr-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <FieldInput
                label="Layout Code"
                required
                value={row.code}
                onChange={(v) => update(i, "code", v)}
                placeholder="e.g. TYPE_A"
              />
              <FieldInput
                label="Layout Name"
                value={row.name}
                onChange={(v) => update(i, "name", v)}
                placeholder="e.g. Studio"
              />
              <FieldInput
                label="Bedrooms"
                required
                value={row.bedrooms}
                onChange={(v) => update(i, "bedrooms", v)}
                type="number"
              />
              <FieldInput
                label="Bathrooms"
                required
                value={row.bathrooms}
                onChange={(v) => update(i, "bathrooms", v)}
                type="number"
              />
              <FieldInput
                label="Built-up (sqft)"
                required
                value={row.builtUpSqft}
                onChange={(v) => update(i, "builtUpSqft", v)}
                placeholder="e.g. 403"
                type="number"
              />
              <FieldInput
                label="Study Rooms"
                value={row.studyRooms}
                onChange={(v) => update(i, "studyRooms", v)}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <FieldInput
                label="Ceiling Height (m)"
                value={row.ceilingHeightM}
                onChange={(v) => update(i, "ceilingHeightM", v)}
                placeholder="e.g. 3.0"
                type="number"
              />
              <FieldSelect
                label="Furnishing Status"
                value={row.furnishingStatus}
                onChange={(v) => update(i, "furnishingStatus", v)}
                options={FURNISHING_OPTIONS}
              />
              <FieldSwitch
                label="Balcony"
                checked={row.hasBalcony}
                onChange={(v) => update(i, "hasBalcony", v)}
              />
              <FieldSwitch
                label="Yard"
                checked={row.hasYard}
                onChange={(v) => update(i, "hasYard", v)}
              />
              <FieldSwitch
                label="Dual Key"
                checked={row.isDualKey}
                onChange={(v) => update(i, "isDualKey", v)}
              />
            </div>
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
