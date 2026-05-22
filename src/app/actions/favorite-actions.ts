'use server';

import { db } from '@/db';
import { favorites, projects } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getServerSession } from '@/lib/server-auth';
import type { ActionResult } from '@/types/action-result.types';

export async function toggleFavorite(projectId: string): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await getServerSession();
  if (!session) return { success: false, error: 'Please sign in to save properties' };

  const userId = session.user.id;

  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      eq(favorites.projectId, projectId),
    ),
  });

  if (existing) {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.projectId, projectId),
      ),
    );
    return { success: true, data: { isFavorite: false } };
  }

  await db.insert(favorites).values({ userId, projectId });
  return { success: true, data: { isFavorite: true } };
}

export async function getFavoriteIds(): Promise<string[]> {
  const session = await getServerSession();
  if (!session) return [];

  const rows = await db.query.favorites.findMany({
    where: eq(favorites.userId, session.user.id),
    columns: { projectId: true },
  });

  return rows.map((r) => r.projectId);
}

export async function getFavoriteProjects(): Promise<ActionResult<{
  projects: { id: string; slug: string; name: string; displayName: string | null; featuredImage: string | null }[];
}>> {
  const session = await getServerSession();
  if (!session) return { success: false, error: 'Please sign in to view favorites' };

  const rows = await db.query.favorites.findMany({
    where: eq(favorites.userId, session.user.id),
    columns: { projectId: true },
  });

  if (rows.length === 0) return { success: true, data: { projects: [] } };

  const projectIds = rows.map((r) => r.projectId);
  const projectsData = await db.query.projects.findMany({
    where: inArray(projects.id, projectIds),
    columns: { id: true, slug: true, name: true, displayName: true, featuredFileId: true },
  });

  return {
    success: true,
    data: {
      projects: projectsData.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        displayName: p.displayName,
        featuredImage: null, // Resolved client-side or via separate file lookup
      })),
    },
  };
}
