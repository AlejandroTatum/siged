import type { Grade, Plan, Subject } from "./types";

/**
 * Discriminated union of any record managed by the planning feature.
 *
 * The feature exposes three record kinds (Plan, Grade, Subject) and most
 * table/form interactions treat them uniformly. This alias lives outside
 * `types.ts` so the canonical type surface is unchanged.
 */
export type PlanningItem = Plan | Grade | Subject;
