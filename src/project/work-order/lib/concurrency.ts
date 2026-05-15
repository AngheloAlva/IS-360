import { Prisma } from "@/generated/prisma/client"

/**
 * Acquires a Postgres advisory transactional lock keyed by workOrderId.
 * Uses hashtext() to map the CUID string to an int4 namespace.
 * Released automatically on COMMIT or ROLLBACK (xact variant — no manual unlock needed).
 * Only serializes concurrent operations on the SAME workOrder; different workOrders run in parallel.
 */
export async function acquireWorkOrderLock(
	tx: Prisma.TransactionClient,
	workOrderId: string
): Promise<void> {
	await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${workOrderId}::text))`
}
