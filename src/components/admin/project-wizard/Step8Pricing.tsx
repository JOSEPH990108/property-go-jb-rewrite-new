"use client";

import type {
  PricingSnapshotRow,
  PhaseRow,
  TowerRow,
  LayoutRow,
  DropdownOptions,
} from "@/app/actions/project-setup-actions";
import { DynamicRows, FieldInput, FieldSelect, SectionHeading } from "./WizardComponents";

type Props = {
  rows: PricingSnapshotRow[];
  onChange: (rows: PricingSnapshotRow[]) => void;
  phases: PhaseRow[];
  towers: TowerRow[];
  layouts: LayoutRow[];
  options: DropdownOptions;
};

const emptySnapshot = (): PricingSnapshotRow => ({
  phaseName: "",
  towerNumber: "",
  layoutCode: "",
  buyerTypeId: "",
  viewKey: "",
  spaPriceMin: "",
  spaPriceMax: "",
  nettPriceMin: "",
  nettPriceMax: "",
  rebatePercentTotal: "",
  snapshotDate: "",
  sourceNote: "",
});

export function Step8Pricing({ rows, onChange, phases, towers, layouts, options }: Props) {
  const update = (i: number, field: keyof PricingSnapshotRow, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  const phaseOptions = phases.filter((p) => p.name).map((p) => ({ value: p.name, label: p.name }));
  const towerOptions = towers
    .filter((t) => t.towerNumber)
    .map((t) => ({ value: t.towerNumber, label: t.towerNumber }));
  const layoutOptions = layouts
    .filter((l) => l.code)
    .map((l) => ({ value: l.code, label: `${l.code}${l.name ? ` — ${l.name}` : ""}` }));

  return (
    <div>
      <SectionHeading
        title="Pricing Snapshots"
        subtitle="Capture price bands per layout and buyer type. Used to show indicative pricing."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, emptySnapshot()])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Pricing Snapshot"
      >
        {(row, i) => (
          <div className="space-y-4 pr-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FieldSelect
                label="Phase"
                value={row.phaseName}
                onChange={(v) => update(i, "phaseName", v)}
                options={phaseOptions}
              />
              <FieldSelect
                label="Tower"
                value={row.towerNumber}
                onChange={(v) => update(i, "towerNumber", v)}
                options={towerOptions}
              />
              <FieldSelect
                label="Layout"
                value={row.layoutCode}
                onChange={(v) => update(i, "layoutCode", v)}
                options={layoutOptions}
              />
              <FieldSelect
                label="Buyer Type"
                value={row.buyerTypeId}
                onChange={(v) => update(i, "buyerTypeId", v)}
                options={options.buyerTypes}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              <FieldInput
                label="View Key"
                value={row.viewKey}
                onChange={(v) => update(i, "viewKey", v)}
                placeholder="e.g. golf_club_view"
              />
              <FieldInput
                label="SPA Min (RM)"
                value={row.spaPriceMin}
                onChange={(v) => update(i, "spaPriceMin", v)}
                placeholder="e.g. 581400"
                type="number"
              />
              <FieldInput
                label="SPA Max (RM)"
                value={row.spaPriceMax}
                onChange={(v) => update(i, "spaPriceMax", v)}
                placeholder="e.g. 602400"
                type="number"
              />
              <FieldInput
                label="Nett Min (RM)"
                value={row.nettPriceMin}
                onChange={(v) => update(i, "nettPriceMin", v)}
                placeholder="e.g. 455817"
                type="number"
              />
              <FieldInput
                label="Nett Max (RM)"
                value={row.nettPriceMax}
                onChange={(v) => update(i, "nettPriceMax", v)}
                placeholder="e.g. 472281"
                type="number"
              />
              <FieldInput
                label="Rebate (%)"
                value={row.rebatePercentTotal}
                onChange={(v) => update(i, "rebatePercentTotal", v)}
                placeholder="e.g. 22.00"
                type="number"
              />
              <FieldInput
                label="Snapshot Date"
                required
                value={row.snapshotDate}
                onChange={(v) => update(i, "snapshotDate", v)}
                type="date"
              />
              <FieldInput
                label="Source Note"
                value={row.sourceNote}
                onChange={(v) => update(i, "sourceNote", v)}
                placeholder="Optional note"
              />
            </div>
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
