import { NextResponse } from "next/server"

import { WORK_PERMIT_STATUS, MODULES, ACTIVITY_TYPE } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
	try {
		const today = new Date()
		today.setHours(23, 59, 59, 999)

		const activeWorkPermits = await prisma.workPermit.findMany({
			where: {
				status: WORK_PERMIT_STATUS.ACTIVE,
				endDate: {
					lte: today,
				},
			},
			select: {
				id: true,
				otNumber: {
					select: {
						otNumber: true,
						workRequest: true,
					},
				},
				company: {
					select: {
						id: true,
						name: true,
					},
				},
				user: {
					select: {
						id: true,
						name: true,
					},
				},
				startDate: true,
				endDate: true,
			},
		})

		if (activeWorkPermits.length === 0) {
			return NextResponse.json({
				success: true,
				message: "No active work permits to close",
				closedPermits: 0,
			})
		}

		await prisma.workPermit.updateMany({
			where: {
				id: {
					in: activeWorkPermits.map((wp) => wp.id),
				},
			},
			data: {
				status: WORK_PERMIT_STATUS.COMPLETED,
				closingDate: new Date(),
			},
		})

		const activityPromises = activeWorkPermits.map((workPermit) =>
			logActivity({
				userId: "DkDwzZxqvpzRoqKyPAIAZVsSv7U9rz4H",
				module: MODULES.WORK_PERMITS,
				action: ACTIVITY_TYPE.COMPLETE,
				entityId: workPermit.id,
				entityType: "WorkPermit",
				metadata: {
					status: WORK_PERMIT_STATUS.COMPLETED,
					closingDate: new Date().toISOString(),
					closedBy: "SYSTEM_AUTO_CLOSURE",
					otNumber: workPermit.otNumber?.otNumber || "URGENT",
					workRequest: workPermit.otNumber?.workRequest || "N/A",
					companyName: workPermit.company.name,
					userName: workPermit.user.name,
					startDate: workPermit.startDate.toISOString(),
					endDate: workPermit.endDate.toISOString(),
				},
			})
		)

		await Promise.all(activityPromises)

		return NextResponse.json({
			success: true,
			message: "Work permits closed successfully",
		})
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "Error closing work permits",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		)
	}
}
