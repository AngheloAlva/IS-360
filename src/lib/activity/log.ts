import { ACTIVITY_TYPE, MODULES, Prisma } from "@prisma/client"
import prisma from "../prisma"

type ActivityLogParams = {
	userId: string
	module: MODULES
	entityId: string
	entityType: string
	action: ACTIVITY_TYPE
	metadata?: Record<string, unknown>
}

export async function logActivity({
	userId,
	module,
	action,
	entityId,
	entityType,
	metadata,
}: ActivityLogParams) {
	try {
		await prisma.activityLog.create({
			data: {
				userId,
				module,
				action,
				entityId,
				entityType,
				metadata: metadata ? (metadata as Prisma.JsonObject) : undefined,
			},
		})
	} catch (error) {
		console.error("Error logging activity:", error)
	}
}
