import type { PGlite } from "@electric-sql/pglite"

/**
 * Recompute `work_order.progress` as the weighted sum of COMPLETED milestones.
 *
 * Domain rule: progress is the authoritative aggregate, not a free-form field.
 * Any state-change action that flips a milestone to/from `status='COMPLETED'`
 * must call this so the percentage in the UI stays in sync with milestone state.
 */
export async function recomputeWorkOrderProgress(
	db: PGlite,
	workOrderId: string,
	updatedAt: string
): Promise<void> {
	await db.query(
		`UPDATE "work_order"
		 SET progress = COALESCE((
			 SELECT SUM(weight)::float
			 FROM "milestone"
			 WHERE "workOrderId" = $1 AND status = 'COMPLETED'
		 ), 0),
		 "updatedAt" = $2
		 WHERE id = $1`,
		[workOrderId, updatedAt]
	)
}
