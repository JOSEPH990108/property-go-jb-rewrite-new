"use client";

import type { TowerRow, PhaseRow } from "@/app/actions/project-setup-actions";
import { DynamicRows, FieldInput, FieldSelect, SectionHeading } from "./WizardComponents";

type Props = {
  rows: TowerRow[];
  onChange: (rows: TowerRow[]) => void;
  phases: PhaseRow[];
};

const emptyTower = (): TowerRow => ({
  phaseName: "",
  towerNumber: "",
  name: "",
  floorCount: "",
  floorMin: "",
  floorMax: "",
});

export function Step3Towers({ rows, onChange, phases }: Props) {
  const update = (i: number, field: keyof TowerRow, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  const phaseOptions = phases
    .filter((p) => p.name)
    .map((p) => ({ value: p.name, label: p.name }));

  return (
    <div>
      <SectionHeading
        title="Towers / Blocks"
        subtitle="Add each tower or block. Reference the phase name from the previous step."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, emptyTower()])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Tower"
      >
        {(row, i) => (
          <div className="grid grid-cols-2 gap-4 pr-8 sm:grid-cols-3 lg:grid-cols-6">
            <FieldSelect label="Phase" value={row.phaseName} onChange={(v) => update(i, "phaseName", v)} options={phaseOptions} placeholder="Select phase…" />
            <FieldInput label="Tower Number" required value={row.towerNumber} onChange={(v) => update(i, "towerNumber", v)} placeholder="e.g. TOWER-A" />
            <FieldInput label="Tower Name" value={row.name} onChange={(v) => update(i, "name", v)} placeholder="e.g. Tower A" />
            <FieldInput label="Floor Count" value={row.floorCount} onChange={(v) => update(i, "floorCount", v)} placeholder="e.g. 59" type="number" />
            <FieldInput label="Floor Min (Residential)" value={row.floorMin} onChange={(v) => update(i, "floorMin", v)} placeholder="e.g. 13" type="number" />
            <FieldInput label="Floor Max" value={row.floorMax} onChange={(v) => update(i, "floorMax", v)} placeholder="e.g. 59" type="number" />
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
