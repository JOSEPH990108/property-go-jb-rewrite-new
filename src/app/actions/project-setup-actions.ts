'use server';

import { randomUUID } from 'crypto';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import {
  projects,
  projectPhases,
  projectTowers,
  projectLayouts,
  towerFacingGroups,
  towerStacks,
  towerSpecialFloors,
  salesPackages,
  projectNearbyPlaces,
  pricingSnapshots,
  developers,
  propertyCategories,
  propertyTypes,
  projectStatuses,
  tenureTypes,
  titleTypes,
  regions,
  areas,
  constructionStatuses,
  buyerTypes,
} from '@/db/schema';
import { requireAdmin } from '@/lib/server-auth';
import type { ActionResult } from '@/types/action-result.types';

// ── Dropdown option types ────────────────────────────────────────────────────

export type DropdownOptions = {
  developers: { value: string; label: string }[];
  propertyCategories: { value: string; label: string }[];
  propertyTypes: { value: string; label: string }[];
  projectStatuses: { value: string; label: string }[];
  tenureTypes: { value: string; label: string }[];
  titleTypes: { value: string; label: string }[];
  regions: { value: string; label: string }[];
  areas: { value: string; label: string }[];
  constructionStatuses: { value: string; label: string }[];
  buyerTypes: { value: string; label: string }[];
};

// ── Input types (wizard form state) ─────────────────────────────────────────

export type ProjectFormData = {
  slug: string;
  name: string;
  displayName: string;
  legalName: string;
  description: string;
  developerId: string;
  propertyCategoryId: string;
  propertyTypeId: string;
  projectStatusId: string;
  tenureTypeId: string;
  titleTypeId: string;
  regionId: string;
  areaId: string;
  address: string;
  latitude: string;
  longitude: string;
  landAreaAcres: string;
  bookingFee: string;
  bookingFeeBumi: string;
  maintenanceFeePerSqft: string;
  sinkingFundPerSqft: string;
  isForeignerEligible: boolean;
  isGatedCommunity: boolean;
  isHotDeal: boolean;
  isPublished: boolean;
  greenCertification: string;
  totalUnits: string;
  launchYear: string;
};

export type PhaseRow = {
  phaseCode: string;
  name: string;
  completionDate: string;
  constructionStatusId: string;
};

export type TowerRow = {
  phaseName: string;
  towerNumber: string;
  name: string;
  floorCount: string;
  floorMin: string;
  floorMax: string;
};

export type LayoutRow = {
  code: string;
  name: string;
  bedrooms: string;
  bathrooms: string;
  builtUpSqft: string;
  studyRooms: string;
  hasBalcony: boolean;
  hasYard: boolean;
  isDualKey: boolean;
  ceilingHeightM: string;
  furnishingStatus: string;
};

export type FacingGroupRow = {
  towerNumber: string;
  key: string;
  label: string;
  sortOrder: string;
};

export type StackRow = {
  towerNumber: string;
  stackNo: string;
  layoutCode: string;
  builtUpSqft: string;
  facingGroupKey: string;
  sortOrder: string;
};

export type SpecialFloorRow = {
  towerNumber: string;
  floorKind: string;
  floorNumber: string;
  floorLabel: string;
  facilityLabel: string;
  sortOrder: string;
};

export type SalesPackageRow = {
  name: string;
  buyerTypeId: string;
  rebatePercentage: string;
  cashBackAmount: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
};

export type NearbyPlaceRow = {
  name: string;
  category: string;
  distanceKm: string;
  sortOrder: string;
};

export type PricingSnapshotRow = {
  phaseName: string;
  towerNumber: string;
  layoutCode: string;
  buyerTypeId: string;
  viewKey: string;
  spaPriceMin: string;
  spaPriceMax: string;
  nettPriceMin: string;
  nettPriceMax: string;
  rebatePercentTotal: string;
  snapshotDate: string;
  sourceNote: string;
};

export type CreateFullProjectInput = {
  project: ProjectFormData;
  phases: PhaseRow[];
  towers: TowerRow[];
  layouts: LayoutRow[];
  facingGroups: FacingGroupRow[];
  stacks: StackRow[];
  specialFloors: SpecialFloorRow[];
  salesPackages: SalesPackageRow[];
  nearbyPlaces: NearbyPlaceRow[];
  pricingSnapshots: PricingSnapshotRow[];
};

// ── Fetch all dropdown options ───────────────────────────────────────────────

export async function getProjectWizardOptions(): Promise<ActionResult<DropdownOptions>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, error: admin.error };

  const [devs, cats, types, statuses, tenures, titles, regs, areasData, constrStatuses, buyerTypesData] =
    await Promise.all([
      db.select({ value: developers.id, label: developers.name }).from(developers).orderBy(asc(developers.name)),
      db.select({ value: propertyCategories.id, label: propertyCategories.name }).from(propertyCategories).orderBy(asc(propertyCategories.sortOrder)),
      db.select({ value: propertyTypes.id, label: propertyTypes.name }).from(propertyTypes).orderBy(asc(propertyTypes.sortOrder)),
      db.select({ value: projectStatuses.id, label: projectStatuses.name }).from(projectStatuses).orderBy(asc(projectStatuses.sortOrder)),
      db.select({ value: tenureTypes.id, label: tenureTypes.name }).from(tenureTypes).orderBy(asc(tenureTypes.sortOrder)),
      db.select({ value: titleTypes.id, label: titleTypes.name }).from(titleTypes).orderBy(asc(titleTypes.sortOrder)),
      db.select({ value: regions.id, label: regions.name }).from(regions).orderBy(asc(regions.name)),
      db.select({ value: areas.id, label: areas.name }).from(areas).orderBy(asc(areas.name)),
      db.select({ value: constructionStatuses.id, label: constructionStatuses.name }).from(constructionStatuses).orderBy(asc(constructionStatuses.sortOrder)),
      db.select({ value: buyerTypes.id, label: buyerTypes.name }).from(buyerTypes).orderBy(asc(buyerTypes.sortOrder)),
    ]);

  return {
    success: true,
    data: {
      developers: devs.map((r) => ({ value: String(r.value), label: String(r.label) })),
      propertyCategories: cats.map((r) => ({ value: String(r.value), label: String(r.label) })),
      propertyTypes: types.map((r) => ({ value: String(r.value), label: String(r.label) })),
      projectStatuses: statuses.map((r) => ({ value: String(r.value), label: String(r.label) })),
      tenureTypes: tenures.map((r) => ({ value: String(r.value), label: String(r.label) })),
      titleTypes: titles.map((r) => ({ value: String(r.value), label: String(r.label) })),
      regions: regs.map((r) => ({ value: String(r.value), label: String(r.label) })),
      areas: areasData.map((r) => ({ value: String(r.value), label: String(r.label) })),
      constructionStatuses: constrStatuses.map((r) => ({ value: String(r.value), label: String(r.label) })),
      buyerTypes: buyerTypesData.map((r) => ({ value: String(r.value), label: String(r.label) })),
    },
  };
}

// ── Main create action ───────────────────────────────────────────────────────

export async function createFullProject(
  input: CreateFullProjectInput,
): Promise<ActionResult<{ projectId: string }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, error: admin.error };

  if (!input.project.slug || !input.project.name || !input.project.developerId || !input.project.tenureTypeId) {
    return { success: false, error: 'Project slug, name, developer, and tenure type are required.' };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const p = input.project;

      // 1. Create project
      const [project] = await tx
        .insert(projects)
        .values({
          id: randomUUID(),
          slug: p.slug,
          name: p.name,
          displayName: p.displayName || null,
          legalName: p.legalName || null,
          description: p.description || null,
          developerId: p.developerId,
          propertyCategoryId: p.propertyCategoryId || null,
          propertyTypeId: p.propertyTypeId || null,
          projectStatusId: p.projectStatusId || null,
          tenureTypeId: p.tenureTypeId,
          titleTypeId: p.titleTypeId || null,
          regionId: p.regionId || null,
          areaId: p.areaId || null,
          address: p.address || null,
          latitude: p.latitude || null,
          longitude: p.longitude || null,
          landAreaAcres: p.landAreaAcres || null,
          bookingFee: p.bookingFee || '1000.00',
          bookingFeeBumi: p.bookingFeeBumi || null,
          maintenanceFeePerSqft: p.maintenanceFeePerSqft || null,
          sinkingFundPerSqft: p.sinkingFundPerSqft || null,
          isForeignerEligible: p.isForeignerEligible,
          isGatedCommunity: p.isGatedCommunity,
          greenCertification: p.greenCertification || null,
          totalUnits: p.totalUnits ? parseInt(p.totalUnits) : null,
          launchYear: p.launchYear ? parseInt(p.launchYear) : null,
          isHotDeal: p.isHotDeal,
          isPublished: p.isPublished,
        })
        .returning();

      const projectId = project.id;

      // 2. Phases — build name → id map
      const phaseMap: Record<string, string> = {};
      for (const phase of input.phases) {
        if (!phase.name) continue;
        const [ph] = await tx
          .insert(projectPhases)
          .values({
            id: randomUUID(),
            projectId,
            name: phase.name,
            phaseCode: phase.phaseCode || null,
            completionDate: phase.completionDate || null,
            constructionStatusId: phase.constructionStatusId || null,
          })
          .returning();
        phaseMap[phase.name] = ph.id;
      }

      // 3. Towers — build towerNumber → id map
      const towerMap: Record<string, string> = {};
      for (const tower of input.towers) {
        if (!tower.towerNumber) continue;
        const phaseId = tower.phaseName ? phaseMap[tower.phaseName] : undefined;
        const [tw] = await tx
          .insert(projectTowers)
          .values({
            id: randomUUID(),
            projectId,
            phaseId: phaseId ?? null,
            towerNumber: tower.towerNumber,
            name: tower.name || null,
            floorCount: tower.floorCount ? parseInt(tower.floorCount) : null,
            floorMin: tower.floorMin ? parseInt(tower.floorMin) : null,
            floorMax: tower.floorMax ? parseInt(tower.floorMax) : null,
          })
          .returning();
        towerMap[tower.towerNumber] = tw.id;
      }

      // 4. Layouts — build code → id map
      const layoutMap: Record<string, string> = {};
      for (const layout of input.layouts) {
        if (!layout.code || !layout.builtUpSqft) continue;
        const [ly] = await tx
          .insert(projectLayouts)
          .values({
            id: randomUUID(),
            projectId,
            code: layout.code,
            name: layout.name || null,
            bedrooms: parseInt(layout.bedrooms) || 1,
            bathrooms: parseInt(layout.bathrooms) || 1,
            builtUpSqft: layout.builtUpSqft,
            studyRooms: parseInt(layout.studyRooms) || 0,
            hasBalcony: layout.hasBalcony,
            hasYard: layout.hasYard,
            isDualKey: layout.isDualKey,
            ceilingHeightM: layout.ceilingHeightM || null,
            furnishingStatus: layout.furnishingStatus || 'UNFURNISHED',
          })
          .returning();
        layoutMap[layout.code] = ly.id;
      }

      // 5. Tower facing groups
      for (const fg of input.facingGroups) {
        const towerId = towerMap[fg.towerNumber];
        if (!towerId || !fg.key || !fg.label) continue;
        await tx.insert(towerFacingGroups).values({
          id: randomUUID(),
          towerId,
          key: fg.key,
          label: fg.label,
          sortOrder: parseInt(fg.sortOrder) || 0,
        });
      }

      // 6. Tower stacks
      for (const stack of input.stacks) {
        const towerId = towerMap[stack.towerNumber];
        if (!towerId || !stack.stackNo) continue;
        const layoutId = stack.layoutCode ? layoutMap[stack.layoutCode] : undefined;
        await tx.insert(towerStacks).values({
          id: randomUUID(),
          towerId,
          stackNo: stack.stackNo,
          layoutId: layoutId ?? null,
          layoutCode: stack.layoutCode || null,
          builtUpSqft: stack.builtUpSqft || null,
          facingGroupKey: stack.facingGroupKey || null,
          sortOrder: parseInt(stack.sortOrder) || 0,
        });
      }

      // 7. Tower special floors
      for (const sf of input.specialFloors) {
        const towerId = towerMap[sf.towerNumber];
        if (!towerId || !sf.floorLabel || !sf.floorKind) continue;
        await tx.insert(towerSpecialFloors).values({
          id: randomUUID(),
          towerId,
          floorKind: sf.floorKind,
          floorNumber: sf.floorNumber ? parseInt(sf.floorNumber) : null,
          floorLabel: sf.floorLabel,
          facilityLabel: sf.facilityLabel || null,
          sortOrder: parseInt(sf.sortOrder) || 0,
        });
      }

      // 8. Sales packages
      for (const pkg of input.salesPackages) {
        if (!pkg.name) continue;
        await tx.insert(salesPackages).values({
          id: randomUUID(),
          projectId,
          name: pkg.name,
          buyerTypeId: pkg.buyerTypeId || null,
          rebatePercentage: pkg.rebatePercentage || null,
          cashBackAmount: pkg.cashBackAmount || null,
          validFrom: pkg.validFrom || null,
          validTo: pkg.validTo || null,
          isActive: pkg.isActive,
        });
      }

      // 9. Nearby places
      for (const place of input.nearbyPlaces) {
        if (!place.name || !place.category) continue;
        await tx.insert(projectNearbyPlaces).values({
          id: randomUUID(),
          projectId,
          name: place.name,
          category: place.category,
          distanceKm: place.distanceKm || null,
          sortOrder: parseInt(place.sortOrder) || 0,
        });
      }

      // 10. Pricing snapshots
      for (const snap of input.pricingSnapshots) {
        if (!snap.snapshotDate) continue;
        const phaseId = snap.phaseName ? phaseMap[snap.phaseName] : undefined;
        const towerId = snap.towerNumber ? towerMap[snap.towerNumber] : undefined;
        const layoutId = snap.layoutCode ? layoutMap[snap.layoutCode] : undefined;
        await tx.insert(pricingSnapshots).values({
          id: randomUUID(),
          projectId,
          phaseId: phaseId ?? null,
          towerId: towerId ?? null,
          layoutId: layoutId ?? null,
          buyerTypeId: snap.buyerTypeId || null,
          viewKey: snap.viewKey || null,
          spaPriceMin: snap.spaPriceMin || null,
          spaPriceMax: snap.spaPriceMax || null,
          nettPriceMin: snap.nettPriceMin || null,
          nettPriceMax: snap.nettPriceMax || null,
          rebatePercentTotal: snap.rebatePercentTotal || null,
          snapshotDate: snap.snapshotDate,
          sourceNote: snap.sourceNote || null,
        });
      }

      return projectId;
    });

    return { success: true, data: { projectId: result } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Failed to create project: ${msg}` };
  }
}
