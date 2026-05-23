"use client";

import type { NearbyPlaceRow } from "@/app/actions/project-setup-actions";
import { DynamicRows, FieldInput, FieldSelect, SectionHeading } from "./WizardComponents";

type Props = {
  rows: NearbyPlaceRow[];
  onChange: (rows: NearbyPlaceRow[]) => void;
};

const CATEGORY_OPTIONS = [
  { value: "SHOPPING", label: "Shopping" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "RECREATION", label: "Recreation" },
  { value: "DINING", label: "Dining" },
  { value: "LANDMARK", label: "Landmark" },
  { value: "POLICE", label: "Police / Security" },
  { value: "OTHERS", label: "Others" },
];

const emptyPlace = (): NearbyPlaceRow => ({
  name: "",
  category: "",
  distanceKm: "",
  sortOrder: "",
});

export function Step7NearbyPlaces({ rows, onChange }: Props) {
  const update = (i: number, field: keyof NearbyPlaceRow, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  return (
    <div>
      <SectionHeading
        title="Nearby Places"
        subtitle="Points of interest, amenities, and transport links near the project."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, { ...emptyPlace(), sortOrder: String(rows.length + 1) }])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Nearby Place"
      >
        {(row, i) => (
          <div className="grid grid-cols-2 gap-4 pr-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <FieldInput
                label="Place Name"
                required
                value={row.name}
                onChange={(v) => update(i, "name", v)}
                placeholder="e.g. KSL City Mall"
              />
            </div>
            <FieldSelect
              label="Category"
              required
              value={row.category}
              onChange={(v) => update(i, "category", v)}
              options={CATEGORY_OPTIONS}
            />
            <div className="grid grid-cols-2 gap-2">
              <FieldInput
                label="Distance (km)"
                value={row.distanceKm}
                onChange={(v) => update(i, "distanceKm", v)}
                placeholder="e.g. 2.1"
                type="number"
              />
              <FieldInput
                label="Sort"
                value={row.sortOrder}
                onChange={(v) => update(i, "sortOrder", v)}
                type="number"
              />
            </div>
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
