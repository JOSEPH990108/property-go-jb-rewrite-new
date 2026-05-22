/**
 * Standard return type for server actions.
 * Replaces the duplicated AdminResult<T> / CrudResult<T> patterns.
 */
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
