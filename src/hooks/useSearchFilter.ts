import { useMemo } from "react";

export type UseSearchFilterOptions<TItem> = {
  items: TItem[];
  query: string;
  getSearchableText: (item: TItem) => string;
};

export function useSearchFilter<TItem>({
  items,
  query,
  getSearchableText,
}: UseSearchFilterOptions<TItem>): TItem[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => getSearchableText(item).toLowerCase().includes(normalizedQuery));
  }, [items, query, getSearchableText]);
}
