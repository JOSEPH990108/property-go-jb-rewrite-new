"use server";

import { db } from "@/db";
import { projects, projectTowers, units, bookingStatuses, projectLayouts } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type {
  ProjectUnitChart,
  TowerAvailability,
  FacingGroupDef,
  StackDef,
  FloorRow,
  UnitCell,
  UnitStatus,
} from "@/lib/unit-chart-data";

// ---------------------------------------------------------------------------
// mapStatusCode — convert DB booking status code to UnitStatus enum
// ---------------------------------------------------------------------------
function mapStatusCode(code: string): UnitStatus {
  if (code === "available") return "available";
  if (code === "reserved") return "reserved";
  return "sold";
}

// ---------------------------------------------------------------------------
// buildTowerFromRows — turn flat unit rows into a TowerAvailability
// ---------------------------------------------------------------------------
function buildTowerFromRows(
  towerId: string,
  towerName: string,
  rows: Array<{
    unitNo: string;
    floor: number | null;
    stack: string | null;
    facing: string | null;
    builtUpSqft: string | null;
    finalPrice: string | null;
    basePrice: string;
    statusCode: string;
    layoutCode: string | null;
  }>,
): TowerAvailability {
  // Collect unique stacks (sorted numerically) with their facing
  const stackMap = new Map<string, { facing: string; sqft: number; layoutType: string }>();

  for (const row of rows) {
    const stackKey = row.stack ?? "XX";
    if (!stackMap.has(stackKey)) {
      stackMap.set(stackKey, {
        facing: row.facing ?? "Not specified",
        sqft: row.builtUpSqft ? Math.round(parseFloat(row.builtUpSqft)) : 0,
        layoutType: row.layoutCode ?? "-",
      });
    }
  }

  // Sort stacks numerically
  const sortedStacks = [...stackMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  // Build facing groups: group consecutive stacks with the same facing
  const facingGroups: FacingGroupDef[] = [];
  const stacks: StackDef[] = [];

  let prevFacing = "";
  let groupIndex = 0;

  for (const [stackNo, info] of sortedStacks) {
    const facingLabel = info.facing;
    const groupKey = prevFacing === facingLabel ? `group-${groupIndex - 1}` : `group-${groupIndex}`;

    if (prevFacing !== facingLabel) {
      facingGroups.push({ key: groupKey, label: facingLabel, stackCount: 0 });
      groupIndex++;
      prevFacing = facingLabel;
    }

    facingGroups[facingGroups.length - 1].stackCount++;

    stacks.push({
      stackNo,
      layoutType: info.layoutType,
      sqft: info.sqft,
      facingGroupKey: facingGroups[facingGroups.length - 1].key,
    });
  }

  // Group units by floor, then build floor rows
  const stackIndex = new Map(stacks.map((s, i) => [s.stackNo, i]));
  const floorMap = new Map<number, UnitCell[]>();

  for (const row of rows) {
    const floorNum = row.floor ?? 0;
    if (!floorMap.has(floorNum)) {
      floorMap.set(floorNum, new Array(stacks.length).fill({ kind: "void" } as UnitCell));
    }

    const idx = stackIndex.get(row.stack ?? "XX");
    if (idx === undefined) continue;

    const price = row.finalPrice ? parseFloat(row.finalPrice) : parseFloat(row.basePrice);

    floorMap.get(floorNum)![idx] = {
      kind: "unit",
      unitNo: row.unitNo,
      status: mapStatusCode(row.statusCode),
      sqft: row.builtUpSqft ? Math.round(parseFloat(row.builtUpSqft)) : 0,
      price: Math.round(price),
      facing: stacks[idx]?.facingGroupKey ?? "",
      layoutType: row.layoutCode ?? "-",
    };
  }

  const floorRows: FloorRow[] = [...floorMap.entries()]
    .sort(([a], [b]) => b - a) // Highest floor first
    .map(([floor, cells]) => ({
      kind: "residential" as const,
      floor,
      floorLabel: String(floor).padStart(2, "0"),
      cells,
    }));

  return { towerId, towerName, facingGroups, stacks, floors: floorRows };
}

// ---------------------------------------------------------------------------
// getProjectUnitAvailability
// Returns real DB data if the project has units, otherwise returns null
// (caller falls back to demo data).
// ---------------------------------------------------------------------------
export async function getProjectUnitAvailability(slug: string): Promise<ProjectUnitChart | null> {
  try {
    // 1. Find the project
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      columns: { id: true, name: true, displayName: true },
    });
    if (!project) return null;

    // 2. Get towers for this project
    const towerRows = await db.query.projectTowers.findMany({
      where: eq(projectTowers.projectId, project.id),
      orderBy: asc(projectTowers.towerNumber),
    });

    if (towerRows.length === 0) return null;

    // 3. Get all units with booking status and layout code
    const unitRows = await db
      .select({
        id: units.id,
        towerId: units.towerId,
        unitNo: units.unitNo,
        floor: units.floor,
        stack: units.stack,
        facing: units.facing,
        builtUpSqft: units.builtUpSqft,
        finalPrice: units.finalPrice,
        basePrice: units.basePrice,
        statusCode: bookingStatuses.code,
        layoutCode: projectLayouts.code,
      })
      .from(units)
      .innerJoin(bookingStatuses, eq(units.bookingStatusId, bookingStatuses.id))
      .leftJoin(projectLayouts, eq(units.layoutId, projectLayouts.id))
      .where(eq(units.projectId, project.id))
      .orderBy(asc(units.stack), asc(units.floor));

    if (unitRows.length === 0) return null;

    // 4. Group units by towerId → build TowerAvailability
    const towerUnitMap = new Map<string, typeof unitRows>();

    for (const row of unitRows) {
      const tid = row.towerId ?? "__no_tower__";
      if (!towerUnitMap.has(tid)) towerUnitMap.set(tid, []);
      towerUnitMap.get(tid)!.push(row);
    }

    const towers: TowerAvailability[] = towerRows
      .map((t) => {
        const towerUnits = towerUnitMap.get(t.id) ?? [];
        if (towerUnits.length === 0) return null;
        return buildTowerFromRows(t.id, t.name ?? t.towerNumber ?? t.id, towerUnits);
      })
      .filter((t): t is TowerAvailability => t !== null);

    // Also handle units not assigned to any tower
    const noTowerUnits = towerUnitMap.get("__no_tower__");
    if (noTowerUnits && noTowerUnits.length > 0) {
      towers.push(buildTowerFromRows("__no_tower__", "Main Block", noTowerUnits));
    }

    if (towers.length === 0) return null;

    return {
      projectSlug: slug,
      projectName: project.displayName ?? project.name,
      isLiveData: true,
      towers,
    };
  } catch {
    // Silently return null — caller falls back to demo data
    return null;
  }
}
