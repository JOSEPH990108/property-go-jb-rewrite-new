// ============================================================
// Types for the public-facing Unit Availability Chart
// ============================================================

export type UnitStatus = "available" | "reserved" | "sold";

export type UnitCell =
  | {
      kind: "unit";
      unitNo: string;
      status: UnitStatus;
      sqft: number;
      price: number;
      facing: string;
      layoutType: string;
    }
  | { kind: "void" };

export type StackDef = {
  stackNo: string;    // "01", "02", ...
  layoutType: string; // "B1", "B2", "P3", ...
  sqft: number;
  facingGroupKey: string;
};

export type FacingGroupDef = {
  key: string;
  label: string;    // "Lake, Golf & City View", "Singapore View", ...
  stackCount: number;
};

export type FloorRow =
  | { kind: "residential"; floor: number; floorLabel: string; cells: UnitCell[] }
  | { kind: "breaktank"; floorLabel: string }
  | { kind: "facility"; floorLabel: string; facilityLabel: string };

export type TowerAvailability = {
  towerId: string;
  towerName: string;
  facingGroups: FacingGroupDef[];
  stacks: StackDef[];
  floors: FloorRow[]; // ordered top (highest floor) → bottom (lowest / facility)
};

export type ProjectUnitChart = {
  projectSlug: string;
  projectName: string;
  isLiveData: boolean; // false = demo data, true = real DB data
  towers: TowerAvailability[];
};

// ============================================================
// Demo data — Sunway Lenang Heights (Tower B + Tower C)
// Data closely mirrors the actual unit chart image:
//   - Tower B: 8 stacks, floors 03-45, breaktank floor 33
//   - Tower C: 19 stacks, floors 03-45, breaktank floor 33
// Statuses use a deterministic hash so they are consistent
// across server/client renders without useState seeding.
// ============================================================

function seededStatus(n: number): UnitStatus {
  // Fast integer hash (Knuth multiplicative hashing)
  const h = ((Math.abs(n) * 2654435761) >>> 0) & 0xffff;
  if (h < 0x8ccc) return "available"; // ~55 %
  if (h < 0xccc0) return "reserved";  // ~25 %
  return "sold";                       // ~20 %
}

// Voids: specific (floor, stackNo) pairs that should show as void (no unit)
type VoidEntry = { floor: number; stackNo: string };

function makeResidentialFloor(
  floor: number,
  stacks: StackDef[],
  voids: VoidEntry[] = []
): FloorRow {
  const voidSet = new Set(voids.filter((v) => v.floor === floor).map((v) => v.stackNo));

  return {
    kind: "residential",
    floor,
    floorLabel: String(floor).padStart(2, "0"),
    cells: stacks.map((stack, i) => {
      if (voidSet.has(stack.stackNo)) return { kind: "void" as const };
      const seed = floor * 100 + i + stack.sqft;
      // Price = sqft × psf base + floor premium (higher floor = higher price)
      const price = Math.round(stack.sqft * 620 + floor * 6_500 + i * 4_200);
      return {
        kind: "unit" as const,
        unitNo: `${String(floor).padStart(2, "0")}-${stack.stackNo}`,
        status: seededStatus(seed),
        sqft: stack.sqft,
        price,
        facing: stack.facingGroupKey,
        layoutType: stack.layoutType,
      };
    }),
  };
}

// breaktankFloor: that floor number is REPLACED by a breaktank row (no units on that level)
function buildTowerFloors(
  floorMin: number,
  floorMax: number,
  breaktankFloor: number | null,
  stacks: StackDef[],
  facilityLevels: Array<{ floorLabel: string; facilityLabel: string }>,
  voids: VoidEntry[] = []
): FloorRow[] {
  const rows: FloorRow[] = [];

  for (let f = floorMax; f >= floorMin; f--) {
    if (breaktankFloor !== null && f === breaktankFloor) {
      // This entire floor is mechanical / break-tank — no units
      rows.push({ kind: "breaktank", floorLabel: "BREAKTANK" });
      continue;
    }
    rows.push(makeResidentialFloor(f, stacks, voids));
  }

  // Facility / podium levels at the very bottom
  for (const level of facilityLevels) {
    rows.push({ kind: "facility", floorLabel: level.floorLabel, facilityLabel: level.facilityLabel });
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────
// TOWER B — 8 Stacks  (matches chart image)
// Facing: Lake,Golf&City(01-04) | Singapore View(05-06) | Lake,Golf&City(07-08)
// Types : F2, P1, P1, F2        | P3, P3                | D1, D1
// BUA   : 2078, 1787, 1787, 2078| 1187, 1187            | 692, 692
// ─────────────────────────────────────────────────────────────
const TOWER_B_STACKS: StackDef[] = [
  { stackNo: "01", layoutType: "F2", sqft: 2078, facingGroupKey: "lgc-left" },
  { stackNo: "02", layoutType: "P1", sqft: 1787, facingGroupKey: "lgc-left" },
  { stackNo: "03", layoutType: "P1", sqft: 1787, facingGroupKey: "lgc-left" },
  { stackNo: "04", layoutType: "F2", sqft: 2078, facingGroupKey: "lgc-left" },
  { stackNo: "05", layoutType: "P3", sqft: 1187, facingGroupKey: "singapore" },
  { stackNo: "06", layoutType: "P3", sqft: 1187, facingGroupKey: "singapore" },
  { stackNo: "07", layoutType: "D1", sqft: 692,  facingGroupKey: "lgc-right" },
  { stackNo: "08", layoutType: "D1", sqft: 692,  facingGroupKey: "lgc-right" },
];

const TOWER_B_FACING_GROUPS: FacingGroupDef[] = [
  { key: "lgc-left",   label: "Lake, Golf & City View", stackCount: 4 },
  { key: "singapore",  label: "Singapore View",          stackCount: 2 },
  { key: "lgc-right",  label: "Lake, Golf & City View", stackCount: 2 },
];

// Lobby / commercial area occupies stacks 05-06 at the lowest 2 podium-adjacent floors
const TOWER_B_VOIDS: VoidEntry[] = [
  { floor: 3, stackNo: "05" }, { floor: 3, stackNo: "06" },
  { floor: 4, stackNo: "05" }, { floor: 4, stackNo: "06" },
];

const TOWER_B_FACILITY_LEVELS = [
  { floorLabel: "Pd 2F",  facilityLabel: "PARKING"                  },
  { floorLabel: "Pd 1F",  facilityLabel: "PARKING"                  },
  { floorLabel: "Pd GF",  facilityLabel: "LOBBY, DROP OFF, PARKING" },
  { floorLabel: "Pd LG1", facilityLabel: "PARKING"                  },
];

const TOWER_B: TowerAvailability = {
  towerId: "B",
  towerName: "Tower B",
  facingGroups: TOWER_B_FACING_GROUPS,
  stacks: TOWER_B_STACKS,
  floors: buildTowerFloors(3, 45, 33, TOWER_B_STACKS, TOWER_B_FACILITY_LEVELS, TOWER_B_VOIDS),
};

// ─────────────────────────────────────────────────────────────
// TOWER C — 19 Stacks  (matches chart image)
// Facing: Facilities(01-05) | Lake,Golf&City(06-14) | Facilities(15-19)
// Types : C1×5              | C2×3 + C3×6           | C4×5
// BUA   : 709×5             | 788×3 + 700×6         | 709×5
// ─────────────────────────────────────────────────────────────
const TOWER_C_STACKS: StackDef[] = [
  // Facilities View — left wing (5 stacks)
  { stackNo: "01", layoutType: "C1", sqft: 709, facingGroupKey: "fac-left" },
  { stackNo: "02", layoutType: "C1", sqft: 709, facingGroupKey: "fac-left" },
  { stackNo: "03", layoutType: "C1", sqft: 709, facingGroupKey: "fac-left" },
  { stackNo: "04", layoutType: "C1", sqft: 709, facingGroupKey: "fac-left" },
  { stackNo: "05", layoutType: "C1", sqft: 709, facingGroupKey: "fac-left" },
  // Lake, Golf & City View — centre (9 stacks)
  { stackNo: "06", layoutType: "C2", sqft: 788, facingGroupKey: "lgc-c" },
  { stackNo: "07", layoutType: "C2", sqft: 788, facingGroupKey: "lgc-c" },
  { stackNo: "08", layoutType: "C2", sqft: 788, facingGroupKey: "lgc-c" },
  { stackNo: "09", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  { stackNo: "10", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  { stackNo: "11", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  { stackNo: "12", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  { stackNo: "13", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  { stackNo: "14", layoutType: "C3", sqft: 700, facingGroupKey: "lgc-c" },
  // Facilities View — right wing (5 stacks)
  { stackNo: "15", layoutType: "C4", sqft: 709, facingGroupKey: "fac-right" },
  { stackNo: "16", layoutType: "C4", sqft: 709, facingGroupKey: "fac-right" },
  { stackNo: "17", layoutType: "C4", sqft: 709, facingGroupKey: "fac-right" },
  { stackNo: "18", layoutType: "C4", sqft: 709, facingGroupKey: "fac-right" },
  { stackNo: "19", layoutType: "C4", sqft: 709, facingGroupKey: "fac-right" },
];

const TOWER_C_FACING_GROUPS: FacingGroupDef[] = [
  { key: "fac-left",  label: "Facilities View",        stackCount: 5 },
  { key: "lgc-c",     label: "Lake, Golf & City View", stackCount: 9 },
  { key: "fac-right", label: "Facilities View",        stackCount: 5 },
];

// Corner stacks at lowest residential floors are void (no unit — stairwell/services)
const TOWER_C_VOIDS: VoidEntry[] = [
  { floor: 3, stackNo: "01" }, { floor: 3, stackNo: "19" },
  { floor: 4, stackNo: "01" }, { floor: 4, stackNo: "19" },
  { floor: 5, stackNo: "01" }, { floor: 5, stackNo: "19" },
];

// Tower C has an extra "Facilities" deck level + one more basement parking
const TOWER_C_FACILITY_LEVELS = [
  { floorLabel: "FACILITIES", facilityLabel: "FACILITIES DECK"             },
  { floorLabel: "Pd -2F",     facilityLabel: "PARKING"                     },
  { floorLabel: "Pd -1F",     facilityLabel: "PARKING"                     },
  { floorLabel: "Pd GF",      facilityLabel: "LOBBY, DROP OFF, PARKING"    },
  { floorLabel: "Pd LG1",     facilityLabel: "PARKING"                     },
  { floorLabel: "Pd LG2",     facilityLabel: "PARKING"                     },
];

const TOWER_C: TowerAvailability = {
  towerId: "C",
  towerName: "Tower C",
  facingGroups: TOWER_C_FACING_GROUPS,
  stacks: TOWER_C_STACKS,
  floors: buildTowerFloors(3, 45, 33, TOWER_C_STACKS, TOWER_C_FACILITY_LEVELS, TOWER_C_VOIDS),
};

// ─────────────────────────────────────────────────────────────
// Exported demo project
// ─────────────────────────────────────────────────────────────
export const DEMO_PROJECT: ProjectUnitChart = {
  projectSlug: "__demo__",
  projectName: "Sunway Lenang Heights",
  isLiveData: false,
  towers: [TOWER_B, TOWER_C],
};
