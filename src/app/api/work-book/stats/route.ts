import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		// Get statistics
		const stats = await prisma.$transaction([
			// Total active work books
			prisma.workOrder.count({
				where: {
					isWorkBook: true,
					status: { in: ["IN_PROGRESS", "PENDING"] },
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			// Total completed work books
			prisma.workOrder.count({
				where: {
					isWorkBook: true,
					status: "COMPLETED",
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			// Total entries in all work books
			prisma.workEntry.count({
				where: {
					workOrder: {
						isWorkBook: true,
					},
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			// Average entries per work book
			prisma.workOrder.aggregate({
				where: {
					isWorkBook: true,
				},
				_avg: {
					workProgressStatus: true,
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
		])

		const [activeCount, completedCount, totalEntries, avgProgress] = stats

		return NextResponse.json({
			stats: {
				activeCount,
				completedCount,
				totalEntries,
				avgProgress: avgProgress._avg.workProgressStatus || 0,
			},
		})
	} catch (error) {
		console.error("[WORK_BOOKS_GET]", error)
		return NextResponse.json({ error: "Error fetching work books" }, { status: 500 })
	}
}
