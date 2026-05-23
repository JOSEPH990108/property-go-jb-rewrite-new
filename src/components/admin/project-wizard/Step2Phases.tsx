"use client";

import type { PhaseRow, DropdownOptions } from "@/app/actions/project-setup-actions";
import { DynamicRows, FieldInput, FieldSelect, SectionHeading } from "./WizardComponents";

type Props = {
  rows: PhaseRow[];
  onChange: (rows: PhaseRow[]) => void;
  options: DropdownOptions;
};

const emptyPhase = (): PhaseRow => ({
  phaseCode: "",
  name: "",
  completionDate: "",
  constructionStatusId: "",
});

export function Step2Phases({ rows, onChange, options }: Props) {
  const update = (i: number, field: keyof PhaseRow, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  return (
    <div>
      <SectionHeading
        title="Project Phases"
        subtitle="Define each phase of the development. Leave empty to skip."
      />
      <DynamicRows
        rows={rows}
        addRow={() => onChange([...rows, emptyPhase()])}
        removeRow={(i) => onChange(rows.filter((_, j) => j !== i))}
        addLabel="Add Phase"
      >
        {(row, i) => (
          <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-2 lg:grid-cols-4">
            <FieldInput
              label="Phase Code"
              value={row.phaseCode}
              onChange={(v) => update(i, "phaseCode", v)}
              placeholder="e.g. P1"
            />
            <FieldInput
              label="Phase Name"
              required
              value={row.name}
              onChange={(v) => update(i, "name", v)}
              placeholder="e.g. Phase 1"
            />
            <FieldInput
              label="Completion Date"
              value={row.completionDate}
              onChange={(v) => update(i, "completionDate", v)}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <FieldSelect
              label="Construction Status"
              value={row.constructionStatusId}
              onChange={(v) => update(i, "constructionStatusId", v)}
              options={options.constructionStatuses}
            />
          </div>
        )}
      </DynamicRows>
    </div>
  );
}
