// src\app\actions\admin-actions.ts
"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  appointments,
  areas,
  developers,
  projectStatuses,
  projects,
  propertyCategories,
  propertyTypes,
  regions,
  roles,
  tenureTypes,
  user,
} from "@/db/schema";
import { requireAdmin } from "@/lib/server-auth";
import type { ActionResult } from "@/types/action-result.types";

type AdminResult<T = undefined> = ActionResult<T>;

export type AdminDashboardData = {
  properties: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    launchYear: number | null;
    totalUnits: number | null;
    isPublished: boolean | null;
    developerId: string;
    propertyCategoryId: string | null;
    propertyTypeId: string | null;
    projectStatusId: string | null;
    tenureTypeId: string;
    regionId: string | null;
    areaId: string | null;
    developerName: string;
    categoryName: string | null;
    typeName: string | null;
    statusName: string | null;
    regionName: string | null;
    areaName: string | null;
  }>;
  agents: Array<{
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    agencyName: string | null;
    renNumber: string | null;
    image: string | null;
  }>;
  lookups: {
    developers: (typeof developers.$inferSelect)[];
    categories: (typeof propertyCategories.$inferSelect)[];
    types: (typeof propertyTypes.$inferSelect)[];
    statuses: (typeof projectStatuses.$inferSelect)[];
    tenures: (typeof tenureTypes.$inferSelect)[];
    regions: (typeof regions.$inferSelect)[];
    areas: (typeof areas.$inferSelect)[];
  };
};

const propertyPayloadSchema = z.object({
  name: z.string().min(2, "Property name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  launchYear: z.number().int().min(1990).max(2100).optional().nullable(),
  totalUnits: z.number().int().min(0).optional().nullable(),
  isPublished: z.boolean().default(false),
  developerId: z.string().min(1, "Developer is required"),
  propertyCategoryId: z.string().optional().nullable(),
  propertyTypeId: z.string().optional().nullable(),
  projectStatusId: z.string().optional().nullable(),
  tenureTypeId: z.string().min(1, "Tenure type is required"),
  regionId: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
});

const agentPayloadSchema = z.object({
  name: z.string().min(2, "Agent name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional().nullable(),
  agencyName: z.string().optional().nullable(),
  renNumber: z.string().optional().nullable(),
  image: z.string().url("Image URL must be valid").optional().nullable(),
});

function nullable<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

export async function getAdminDashboardData(): Promise<AdminResult<AdminDashboardData>> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const [
      devs,
      categoriesData,
      typesData,
      statusesData,
      tenuresData,
      regionsData,
      areasData,
      allProjects,
      agentRole,
    ] = await Promise.all([
      db.query.developers.findMany({ orderBy: [desc(developers.createdAt)] }),
      db.query.propertyCategories.findMany(),
      db.query.propertyTypes.findMany(),
      db.query.projectStatuses.findMany(),
      db.query.tenureTypes.findMany(),
      db.query.regions.findMany(),
      db.query.areas.findMany(),
      db.query.projects.findMany({
        orderBy: [desc(projects.createdAt)],
        with: { developer: true, category: true, type: true, status: true },
      }),
      db.query.roles.findFirst({ where: eq(roles.code, "AGENT") }),
    ]);

    const regionMap = new Map(
      regionsData.map((row: typeof regions.$inferSelect) => [row.id, row.name]),
    );
    const areaMap = new Map(areasData.map((row: typeof areas.$inferSelect) => [row.id, row.name]));

    const properties = allProjects.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      address: row.address,
      launchYear: row.launchYear,
      totalUnits: row.totalUnits,
      isPublished: row.isPublished,
      developerId: row.developerId,
      propertyCategoryId: row.propertyCategoryId,
      propertyTypeId: row.propertyTypeId,
      projectStatusId: row.projectStatusId,
      tenureTypeId: row.tenureTypeId,
      regionId: row.regionId,
      areaId: row.areaId,
      developerName: row.developer.name,
      categoryName: row.category?.name ?? null,
      typeName: row.type?.name ?? null,
      statusName: row.status?.name ?? null,
      regionName: row.regionId ? (regionMap.get(row.regionId) ?? null) : null,
      areaName: row.areaId ? (areaMap.get(row.areaId) ?? null) : null,
    }));

    const agents =
      agentRole == null
        ? []
        : await db.query.user.findMany({
            where: eq(user.roleId, agentRole.id),
            orderBy: [desc(user.createdAt)],
            columns: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              agencyName: true,
              renNumber: true,
              image: true,
            },
          });

    return {
      success: true,
      data: {
        properties,
        agents,
        lookups: {
          developers: devs,
          categories: categoriesData,
          types: typesData,
          statuses: statusesData,
          tenures: tenuresData,
          regions: regionsData,
          areas: areasData,
        },
      },
    };
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return { success: false, error: "Failed to load admin dashboard data" };
  }
}

export async function createProperty(
  payload: z.infer<typeof propertyPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = propertyPayloadSchema.parse(payload);

    await db.insert(projects).values({
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      description: nullable(data.description),
      address: nullable(data.address),
      launchYear: nullable(data.launchYear),
      totalUnits: data.totalUnits ?? 0,
      isPublished: data.isPublished,
      developerId: data.developerId,
      propertyCategoryId: nullable(data.propertyCategoryId),
      propertyTypeId: nullable(data.propertyTypeId),
      projectStatusId: nullable(data.projectStatusId),
      tenureTypeId: data.tenureTypeId,
      regionId: nullable(data.regionId),
      areaId: nullable(data.areaId),
      updatedAt: new Date(),
    });

    revalidatePath("/admin");
    revalidatePath("/properties");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Create property failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return {
      success: false,
      error: "Unable to create property (check slug uniqueness and required fields)",
    };
  }
}

export async function updateProperty(
  id: string,
  payload: z.infer<typeof propertyPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = propertyPayloadSchema.parse(payload);

    await db
      .update(projects)
      .set({
        name: data.name,
        slug: data.slug,
        description: nullable(data.description),
        address: nullable(data.address),
        launchYear: nullable(data.launchYear),
        totalUnits: data.totalUnits ?? 0,
        isPublished: data.isPublished,
        developerId: data.developerId,
        propertyCategoryId: nullable(data.propertyCategoryId),
        propertyTypeId: nullable(data.propertyTypeId),
        projectStatusId: nullable(data.projectStatusId),
        tenureTypeId: data.tenureTypeId,
        regionId: nullable(data.regionId),
        areaId: nullable(data.areaId),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    revalidatePath("/admin");
    revalidatePath("/properties");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update property failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return { success: false, error: "Unable to update property" };
  }
}

export async function deleteProperty(id: string): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    await db.delete(projects).where(eq(projects.id, id));

    revalidatePath("/admin");
    revalidatePath("/properties");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete property failed:", error);
    return {
      success: false,
      error:
        "Unable to delete property. It may be linked to appointments, units, or other records.",
    };
  }
}

export async function createAgent(
  payload: z.infer<typeof agentPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = agentPayloadSchema.parse(payload);
    const agentRole = await db.query.roles.findFirst({ where: eq(roles.code, "AGENT") });
    if (!agentRole) return { success: false, error: "AGENT role is missing in seed data" };

    await db.insert(user).values({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      emailVerified: false,
      phoneNumber: nullable(data.phoneNumber),
      phoneNumberVerified: false,
      roleId: agentRole.id,
      agencyName: nullable(data.agencyName),
      renNumber: nullable(data.renNumber),
      image: nullable(data.image),
      updatedAt: new Date(),
    });

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Create agent failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return { success: false, error: "Unable to create agent (check email uniqueness)" };
  }
}

export async function updateAgent(
  id: string,
  payload: z.infer<typeof agentPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = agentPayloadSchema.parse(payload);
    const agentRole = await db.query.roles.findFirst({ where: eq(roles.code, "AGENT") });
    if (!agentRole) return { success: false, error: "AGENT role is missing in seed data" };

    await db
      .update(user)
      .set({
        name: data.name,
        email: data.email,
        phoneNumber: nullable(data.phoneNumber),
        agencyName: nullable(data.agencyName),
        renNumber: nullable(data.renNumber),
        image: nullable(data.image),
        roleId: agentRole.id,
        updatedAt: new Date(),
      })
      .where(and(eq(user.id, id), eq(user.roleId, agentRole.id)));

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update agent failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return { success: false, error: "Unable to update agent" };
  }
}

export async function deleteAgent(id: string): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };
    if (admin.user.id === id)
      return { success: false, error: "You cannot delete your own account" };

    const agentRole = await db.query.roles.findFirst({ where: eq(roles.code, "AGENT") });
    if (!agentRole) return { success: false, error: "AGENT role is missing in seed data" };

    const linked = await db.query.appointments.findFirst({
      where: eq(appointments.agentId, id),
      columns: { id: true },
    });

    if (linked) {
      return {
        success: false,
        error:
          "This agent has appointment history. Reassign or clear those records before deletion.",
      };
    }

    await db.delete(user).where(and(eq(user.id, id), eq(user.roleId, agentRole.id)));

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete agent failed:", error);
    return { success: false, error: "Unable to delete agent" };
  }
}

// ─── Developer CRUD ──────────────────────────────────────────────────────────

const developerPayloadSchema = z.object({
  name: z.string().min(2, "Developer name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().optional().nullable(),
  legalName: z.string().optional().nullable(),
  countryCode: z.string().max(10).optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export async function createDeveloper(
  payload: z.infer<typeof developerPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = developerPayloadSchema.parse(payload);

    await db.insert(developers).values({
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      description: nullable(data.description),
      legalName: nullable(data.legalName),
      countryCode: nullable(data.countryCode),
      isFeatured: data.isFeatured,
      updatedAt: new Date(),
    });

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Create developer failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return { success: false, error: "Unable to create developer (check slug uniqueness)" };
  }
}

export async function updateDeveloper(
  id: string,
  payload: z.infer<typeof developerPayloadSchema>,
): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const data = developerPayloadSchema.parse(payload);

    await db
      .update(developers)
      .set({
        name: data.name,
        slug: data.slug,
        description: nullable(data.description),
        legalName: nullable(data.legalName),
        countryCode: nullable(data.countryCode),
        isFeatured: data.isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(developers.id, id));

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update developer failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid form data" };
    }
    return { success: false, error: "Unable to update developer" };
  }
}

export async function deleteDeveloper(id: string): Promise<AdminResult> {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return { success: false, error: admin.error };

    const linked = await db.query.projects.findFirst({
      where: eq(projects.developerId, id),
      columns: { id: true },
    });

    if (linked) {
      return {
        success: false,
        error: "This developer has associated projects. Remove or reassign them first.",
      };
    }

    await db.delete(developers).where(eq(developers.id, id));

    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete developer failed:", error);
    return { success: false, error: "Unable to delete developer" };
  }
}
