import { NextRequest, NextResponse } from "next/server"
import { getDaysInMonth, startOfMonth, endOfMonth, addMonths } from "date-fns"
import { headers } from "next/headers"

import { calculateNextDate } from "@/project/maintenance-plan/utils/calculate-next-date"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const searchParams = req.nextUrl.searchParams
	const startMonth = parseInt(searchParams.get("startMonth") ?? "1")
	const startYear = parseInt(searchParams.get("startYear") ?? String(new Date().getFullYear()))
	const rangeMonths = parseInt(searchParams.get("rangeMonths") ?? "12")

	const rangeStart = startOfMonth(new Date(startYear, startMonth - 1, 1))
	const rangeEnd = endOfMonth(addMonths(rangeStart, rangeMonths - 1))

	// Build month metadata
	const months: Array<{ month: number; year: number; daysInMonth: number; label: string }> = []
	const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

	for (let i = 0; i < rangeMonths; i++) {
		const d = addMonths(rangeStart, i)
		const m = d.getMonth() + 1
		const y = d.getFullYear()
		months.push({
			month: m,
			year: y,
			daysInMonth: getDaysInMonth(d),
			label: `${monthLabels[m - 1]} ${y}`,
		})
	}

	try {
		const tasks = await prisma.maintenancePlanTask.findMany({
			where: {
				isActive: true,
				maintenancePlan: { isActive: true },
			},
			select: {
				id: true,
				name: true,
				slug: true,
				nextDate: true,
				frequency: true,
				specialty: true,
				taskType: true,
				originalDayOfMonth: true,
				isAutomated: true,
				automatedDaysInAdvance: true,
				equipment: {
					select: {
						id: true,
						name: true,
						location: { select: { id: true, name: true, path: true, parentId: true } },
						tag: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
						location: { select: { id: true, name: true, path: true, parentId: true } },
						tag: true,
					},
				},
				maintenancePlan: {
					select: { name: true, slug: true },
				},
				workOrders: {
					where: {
						OR: [
							{ programDate: { gte: rangeStart, lte: rangeEnd } },
							{ status: "COMPLETED" },
						],
					},
					orderBy: { programDate: "desc" },
					select: {
						id: true,
						otNumber: true,
						status: true,
						programDate: true,
						endDate: true,
					},
				},
			},
			orderBy: [{ maintenancePlan: { name: "asc" } }, { name: "asc" }],
		})

		const NO_LOCATION_ID = "__no_location__"
		const NO_LOCATION_NAME = "Sin ubicación"

		const scheduleRows = tasks.map((task) => {
			const equipments =
				task.equipments.length > 0 ? task.equipments : task.equipment ? [task.equipment] : []
			const taskLocation = equipments[0]?.location ?? null
			const locationId = taskLocation?.id ?? NO_LOCATION_ID
			const location = taskLocation?.path ?? NO_LOCATION_NAME
			const equipmentName = equipments.map((e) => e.name).join(", ")

			const completedWos = task.workOrders.filter((wo) => wo.status === "COMPLETED")
			const lastCompletedWo = completedWos.sort((a, b) => {
				const aT = a.endDate?.getTime() ?? 0
				const bT = b.endDate?.getTime() ?? 0
				return bT - aT
			})[0]
			const lastCompleted = lastCompletedWo?.endDate ?? null
			const lastCompletedOt = lastCompletedWo?.otNumber ?? null

			const workOrdersInRange = task.workOrders
				.filter((wo) => wo.programDate >= rangeStart && wo.programDate <= rangeEnd)
				.map((wo) => ({
					otNumber: wo.otNumber,
					status: wo.status,
					month: wo.programDate.getMonth() + 1,
					year: wo.programDate.getFullYear(),
					day: wo.programDate.getDate(),
				}))

			// Project dates within the full range
			// scheduledDates: array of { month, year, day }
			const scheduledDates: Array<{ month: number; year: number; day: number }> = []
			let cursor = new Date(task.nextDate)

			if (cursor <= rangeEnd) {
				let iterations = 0
				const maxIterations = 500

				while (cursor <= rangeEnd && iterations < maxIterations) {
					if (cursor >= rangeStart && cursor <= rangeEnd) {
						scheduledDates.push({
							month: cursor.getMonth() + 1,
							year: cursor.getFullYear(),
							day: cursor.getDate(),
						})
					}
					cursor = calculateNextDate(cursor, task.frequency, task.originalDayOfMonth)
					iterations++
				}
			}

			return {
				id: task.id,
				slug: task.slug,
				name: task.name,
				planName: task.maintenancePlan.name,
				planSlug: task.maintenancePlan.slug,
				frequency: task.frequency,
				specialty: task.specialty,
				taskType: task.taskType,
				nextDate: task.nextDate,
				isAutomated: task.isAutomated,
				automatedDaysInAdvance: task.automatedDaysInAdvance ?? 5,
				locationId,
				location,
				equipmentName,
				lastCompleted,
				lastCompletedOt,
				scheduledDates,
				workOrdersInRange,
			}
		})

		const filteredRows = scheduleRows.filter(
			(row) => row.scheduledDates.length > 0 || row.workOrdersInRange.length > 0
		)

		// Group tasks by their leaf location id
		const tasksByLocationId: Record<string, typeof filteredRows> = {}
		const usedLocationIds = new Set<string>()
		for (const row of filteredRows) {
			usedLocationIds.add(row.locationId)
			if (!tasksByLocationId[row.locationId]) tasksByLocationId[row.locationId] = []
			tasksByLocationId[row.locationId].push(row)
		}

		// Pull leaf locations + walk up ancestors so the tree is connected
		const realLeafIds = Array.from(usedLocationIds).filter((id) => id !== NO_LOCATION_ID)
		const locationsMap = new Map<string, { id: string; name: string; parentId: string | null }>()

		if (realLeafIds.length > 0) {
			const leafLocations = await prisma.location.findMany({
				where: { id: { in: realLeafIds } },
				select: { id: true, name: true, parentId: true },
			})
			for (const loc of leafLocations) locationsMap.set(loc.id, loc)

			let pendingParents = leafLocations
				.map((l) => l.parentId)
				.filter((id): id is string => id !== null && !locationsMap.has(id))

			while (pendingParents.length > 0) {
				const ancestors = await prisma.location.findMany({
					where: { id: { in: pendingParents } },
					select: { id: true, name: true, parentId: true },
				})
				for (const loc of ancestors) locationsMap.set(loc.id, loc)
				pendingParents = ancestors
					.map((l) => l.parentId)
					.filter((id): id is string => id !== null && !locationsMap.has(id))
			}
		}

		const locations: Array<{ id: string; name: string; parentId: string | null }> = Array.from(
			locationsMap.values()
		)

		// Sentinel "Sin ubicación" appended only if there are orphan tasks
		if (usedLocationIds.has(NO_LOCATION_ID)) {
			locations.push({ id: NO_LOCATION_ID, name: NO_LOCATION_NAME, parentId: null })
		}

		return NextResponse.json({
			months,
			startMonth,
			startYear,
			rangeMonths,
			locations,
			tasksByLocationId,
		})
	} catch (error) {
		console.error("[MAINTENANCE_SCHEDULE_GET]", error)
		return NextResponse.json({ error: "Error al obtener programación" }, { status: 500 })
	}
}
