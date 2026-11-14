/**
 * Small pure helpers for Cooking mode (step-by-step view).
 * Kept apart from the screen so they are easy to unit-test.
 */

/** Keep a step number inside 0 .. count-1 (0 when there are no steps). */
export function clampStep(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

/** "Step 2 of 8" (index is zero-based). */
export function stepLabel(index: number, count: number): string {
  return `Step ${clampStep(index, count) + 1} of ${count}`;
}

/** 0..1 for the progress bar: how far through the recipe you are. */
export function stepProgress(index: number, count: number): number {
  if (count <= 0) return 0;
  return (clampStep(index, count) + 1) / count;
}
