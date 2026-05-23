"use client";

import type {
  TowerRow,
  LayoutRow,
  FacingGroupRow,
  StackRow,
  SpecialFloorRow,
} from "@/app/actions/project-setup-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicRows, FieldInput, FieldSelect, SectionHeading } from "./WizardComponents";

type Props = {
  towers: TowerRow[];
  layouts: LayoutRow[];
  facingGroups: FacingGroupRow[];
  stacks: StackRow[];
  specialFloors: SpecialFloorRow[];
  onFacingGroupsChange: (rows: FacingGroupRow[]) => void;
  onStacksChange: (rows: StackRow[]) => void;
  onSpecialFloorsChange: (rows: SpecialFloorRow[]) => void;
};

const FLOOR_KIND_OPTIONS = [
  { value: "facility", label: "Facility / Podium" },
  { value: "breaktank", label: "Breaktank / Mechanical" },
];

export function Step5TowerConfig({
  towers,
  layouts,
  facingGroups,
  stacks,
  specialFloors,
  onFacingGroupsChange,
  onStacksChange,
  onSpecialFloorsChange,
}: Props) {
  const activeTowers = towers.filter((t) => t.towerNumber);
  const layoutOptions = layouts
    .filter((l) => l.code)
    .map((l) => ({ value: l.code, label: `${l.code}${l.name ? ` — ${l.name}` : ""}` }));

  return (
    <div>
      <SectionHeading
        title="Tower Configuration"
        subtitle="Configure facing groups, stacks, and special floors per tower."
      />
      {activeTowers.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/50">
          No towers defined yet. Go back to Step 3 to add towers first.
        </p>
      ) : (
        <Tabs defaultValue={activeTowers[0].towerNumber}>
          <TabsList className="mb-6 flex flex-wrap gap-1 bg-transparent">
            {activeTowers.map((t) => (
              <TabsTrigger
                key={t.towerNumber}
                value={t.towerNumber}
                className="data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg border border-white/10 bg-white/5 text-white/60"
              >
                {t.towerNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeTowers.map((tower) => {
            const towerFGs = facingGroups.filter((fg) => fg.towerNumber === tower.towerNumber);
            const towerStacks = stacks.filter((s) => s.towerNumber === tower.towerNumber);
            const towerSFs = specialFloors.filter((sf) => sf.towerNumber === tower.towerNumber);
            const fgOptions = towerFGs
              .filter((fg) => fg.key)
              .map((fg) => ({ value: fg.key, label: `${fg.key} — ${fg.label}` }));

            const updateFG = (i: number, field: keyof FacingGroupRow, value: string) => {
              const updated = [...facingGroups];
              const idx = facingGroups.findIndex(
                (fg, _j) =>
                  fg.towerNumber === tower.towerNumber &&
                  facingGroups.filter((f) => f.towerNumber === tower.towerNumber).indexOf(fg) === i,
              );
              if (idx >= 0) updated[idx] = { ...updated[idx], [field]: value };
              onFacingGroupsChange(updated);
            };

            const updateStack = (i: number, field: keyof StackRow, value: string) => {
              const updated = [...stacks];
              const idx = stacks.findIndex(
                (s, _j) =>
                  s.towerNumber === tower.towerNumber &&
                  stacks.filter((st) => st.towerNumber === tower.towerNumber).indexOf(s) === i,
              );
              if (idx >= 0) updated[idx] = { ...updated[idx], [field]: value };
              onStacksChange(updated);
            };

            const updateSF = (i: number, field: keyof SpecialFloorRow, value: string) => {
              const updated = [...specialFloors];
              const idx = specialFloors.findIndex(
                (sf) =>
                  sf.towerNumber === tower.towerNumber &&
                  specialFloors.filter((s) => s.towerNumber === tower.towerNumber).indexOf(sf) ===
                    i,
              );
              if (idx >= 0) updated[idx] = { ...updated[idx], [field]: value };
              onSpecialFloorsChange(updated);
            };

            return (
              <TabsContent key={tower.towerNumber} value={tower.towerNumber} className="space-y-8">
                {/* Facing Groups */}
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
                    Facing Groups
                  </p>
                  <DynamicRows
                    rows={towerFGs}
                    addRow={() =>
                      onFacingGroupsChange([
                        ...facingGroups,
                        {
                          towerNumber: tower.towerNumber,
                          key: "",
                          label: "",
                          sortOrder: String(towerFGs.length),
                        },
                      ])
                    }
                    removeRow={(i) => {
                      let count = 0;
                      onFacingGroupsChange(
                        facingGroups.filter((fg) => {
                          if (fg.towerNumber !== tower.towerNumber) return true;
                          return count++ !== i;
                        }),
                      );
                    }}
                    addLabel="Add Facing Group"
                  >
                    {(row, i) => (
                      <div className="grid grid-cols-1 gap-4 pr-8 sm:grid-cols-3">
                        <FieldInput
                          label="Key"
                          required
                          value={row.key}
                          onChange={(v) => updateFG(i, "key", v)}
                          placeholder="e.g. NE"
                        />
                        <FieldInput
                          label="Label"
                          required
                          value={row.label}
                          onChange={(v) => updateFG(i, "label", v)}
                          placeholder="e.g. City & Sea View"
                        />
                        <FieldInput
                          label="Sort Order"
                          value={row.sortOrder}
                          onChange={(v) => updateFG(i, "sortOrder", v)}
                          type="number"
                        />
                      </div>
                    )}
                  </DynamicRows>
                </div>

                {/* Stacks */}
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
                    Stacks
                  </p>
                  <DynamicRows
                    rows={towerStacks}
                    addRow={() =>
                      onStacksChange([
                        ...stacks,
                        {
                          towerNumber: tower.towerNumber,
                          stackNo: "",
                          layoutCode: "",
                          builtUpSqft: "",
                          facingGroupKey: "",
                          sortOrder: String(towerStacks.length),
                        },
                      ])
                    }
                    removeRow={(i) => {
                      let count = 0;
                      onStacksChange(
                        stacks.filter((s) => {
                          if (s.towerNumber !== tower.towerNumber) return true;
                          return count++ !== i;
                        }),
                      );
                    }}
                    addLabel="Add Stack"
                  >
                    {(row, i) => (
                      <div className="grid grid-cols-2 gap-4 pr-8 sm:grid-cols-3 lg:grid-cols-5">
                        <FieldInput
                          label="Stack No"
                          required
                          value={row.stackNo}
                          onChange={(v) => updateStack(i, "stackNo", v)}
                          placeholder="e.g. 01"
                        />
                        <FieldSelect
                          label="Layout Code"
                          value={row.layoutCode}
                          onChange={(v) => updateStack(i, "layoutCode", v)}
                          options={layoutOptions}
                        />
                        <FieldInput
                          label="Built-up (sqft)"
                          value={row.builtUpSqft}
                          onChange={(v) => updateStack(i, "builtUpSqft", v)}
                          placeholder="e.g. 403"
                          type="number"
                        />
                        <FieldSelect
                          label="Facing Group"
                          value={row.facingGroupKey}
                          onChange={(v) => updateStack(i, "facingGroupKey", v)}
                          options={fgOptions}
                        />
                        <FieldInput
                          label="Sort Order"
                          value={row.sortOrder}
                          onChange={(v) => updateStack(i, "sortOrder", v)}
                          type="number"
                        />
                      </div>
                    )}
                  </DynamicRows>
                </div>

                {/* Special Floors */}
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
                    Special Floors
                  </p>
                  <DynamicRows
                    rows={towerSFs}
                    addRow={() =>
                      onSpecialFloorsChange([
                        ...specialFloors,
                        {
                          towerNumber: tower.towerNumber,
                          floorKind: "facility",
                          floorNumber: "",
                          floorLabel: "",
                          facilityLabel: "",
                          sortOrder: String(towerSFs.length),
                        },
                      ])
                    }
                    removeRow={(i) => {
                      let count = 0;
                      onSpecialFloorsChange(
                        specialFloors.filter((sf) => {
                          if (sf.towerNumber !== tower.towerNumber) return true;
                          return count++ !== i;
                        }),
                      );
                    }}
                    addLabel="Add Special Floor"
                  >
                    {(row, i) => (
                      <div className="grid grid-cols-2 gap-4 pr-8 sm:grid-cols-3 lg:grid-cols-5">
                        <FieldSelect
                          label="Floor Kind"
                          value={row.floorKind}
                          onChange={(v) => updateSF(i, "floorKind", v)}
                          options={FLOOR_KIND_OPTIONS}
                        />
                        <FieldInput
                          label="Floor Number"
                          value={row.floorNumber}
                          onChange={(v) => updateSF(i, "floorNumber", v)}
                          placeholder="e.g. 12"
                          type="number"
                        />
                        <FieldInput
                          label="Floor Label"
                          required
                          value={row.floorLabel}
                          onChange={(v) => updateSF(i, "floorLabel", v)}
                          placeholder="e.g. Level 12"
                        />
                        <FieldInput
                          label="Facility Label"
                          value={row.facilityLabel}
                          onChange={(v) => updateSF(i, "facilityLabel", v)}
                          placeholder="e.g. Recreation Facilities"
                        />
                        <FieldInput
                          label="Sort Order"
                          value={row.sortOrder}
                          onChange={(v) => updateSF(i, "sortOrder", v)}
                          type="number"
                        />
                      </div>
                    )}
                  </DynamicRows>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
