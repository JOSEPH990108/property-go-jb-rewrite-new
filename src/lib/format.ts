const MYR_FORMATTER = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

/** Format a single price value as MYR. */
export function formatPrice(price: number): string {
  return MYR_FORMATTER.format(price);
}

/** Format a min/max price range as MYR. Returns "Price on Request" when both are null. */
export function formatPriceRange(min: number | null, max: number | null): string {
  if (!min && !max) return "Price on Request";
  if (min && max && min !== max) {
    return `${MYR_FORMATTER.format(min)} - ${MYR_FORMATTER.format(max)}`;
  }
  return MYR_FORMATTER.format(min || max || 0);
}
