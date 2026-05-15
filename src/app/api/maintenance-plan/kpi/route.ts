import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { z } from "zod"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { buildWoWhere } from "./_shared/where"

const HOURS_PER_DAY = 8

// ─── Input validation ─────────────────────────────────────────────────────────

const TASK_SPECIALTY_VALUES = [
	"ELECTRIC",
	"MECHANIC",
	"INSTRUMENTATION_CONTROL",
	"HYDRAULIC",
] as const
const TASK_TYPE_VALUES = ["CLEANING", "INSPECTION", "LUBRICATION", "ADJUSTMENTS"] as const

const filtersSchema = z.object({
	dateFrom: z.iso.datetime({ offset: true }).nullish(),
	dateTo: z.iso.datetime({ offset: true }).nullish(),
	specialty: z.enum(TASK_SPECIALTY_VALUES).nullish(),
	taskType: z.enum(TASK_TYPE_VALUES).nullish(),
	equipmentId: z.string().min(1).nullish(),
	maintenancePlanId: z.string().min(1).nullish(),
})

type Filters = {
	dateFrom: Date | null
	dateTo: Date | null
	specialty: (typeof TASK_SPECIALTY_VALUES)[number] | null
	taskType: (typeof TASK_TYPE_VALUES)[number] | null
	equipmentId: string | null
	maintenancePlanId: string | null
}

// ─── WHERE builder for WR queries (uses "wr" alias) ──────────────────────────

function buildWrWhere(f: Filters): Prisma.Sql {
	const parts: Prisma.Sql[] = [Prisma.sql`1=1`]
	if (f.dateFrom) parts.push(Prisma.sql`wr."createdAt" >= ${f.dateFrom}`)
	if (f.dateTo) parts.push(Prisma.sql`wr."createdAt" <= ${f.dateTo}`)
	return Prisma.join(parts, " AND ")
}

// ─── Month bucket builder (D006) ─────────────────────────────────────────────

interface MonthBucket {
	key: string // "YYYY-MM"
	label: string
	year: number
	month: number // 1-indexed
}

function buildMonthBuckets(from: Date, to: Date, multiYear: boolean): MonthBucket[] {
	const monthNames = [
		"Ene",
		"Feb",
		"Mar",
		"Abr",
		"May",
		"Jun",
		"Jul",
		"Ago",
		"Sep",
		"Oct",
		"Nov",
		"Dic",
	]
	const buckets: MonthBucket[] = []

	const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
	const end = new Date(to.getFullYear(), to.getMonth(), 1)

	while (cursor <= end) {
		const year = cursor.getFullYear()
		const month = cursor.getMonth() + 1
		buckets.push({
			key: `${year}-${String(month).padStart(2, "0")}`,
			label: multiYear ? `${monthNames[month - 1]} ${year}` : monthNames[month - 1],
			year,
			month,
		})
		cursor.setMonth(cursor.getMonth() + 1)
	}

	return buckets
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	// Parse + validate query params
	const sp = request.nextUrl.searchParams
	const rawParams = {
		dateFrom: sp.get("dateFrom") || null,
		dateTo: sp.get("dateTo") || null,
		specialty: sp.get("specialty") || null,
		taskType: sp.get("taskType") || null,
		equipmentId: sp.get("equipmentId") || null,
		maintenancePlanId: sp.get("maintenancePlanId") || null,
	}

	const parsed = filtersSchema.safeParse(rawParams)
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
	}

	const raw = parsed.data
	const filters: Filters = {
		dateFrom: raw.dateFrom ? new Date(raw.dateFrom) : null,
		dateTo: raw.dateTo ? new Date(raw.dateTo) : null,
		specialty: raw.specialty ?? null,
		taskType: raw.taskType ?? null,
		equipmentId: raw.equipmentId ?? null,
		maintenancePlanId: raw.maintenancePlanId ?? null,
	}

	try {
		// ── Determine date range for bucketing ──────────────────────────────
		// If no explicit range, find earliest programDate in DB
		let bucketFrom: Date
		let bucketTo: Date

		if (filters.dateFrom && filters.dateTo) {
			bucketFrom = filters.dateFrom
			bucketTo = filters.dateTo
		} else {
			const earliest = await prisma.$queryRaw<[{ min: Date | null }]>`
				SELECT MIN("programDate") as min FROM work_order WHERE "deletedAt" IS NULL
			`
			bucketFrom = earliest[0]?.min ?? new Date()
			bucketTo = new Date()
		}

		const multiYear = bucketFrom.getFullYear() !== bucketTo.getFullYear()
		const buckets = buildMonthBuckets(bucketFrom, bucketTo, multiYear)

		// Build the join fragment for specialty/taskType (only when needed)
		const needsTaskJoin = !!(filters.specialty || filters.taskType || filters.maintenancePlanId)
		const taskJoinSql = needsTaskJoin
			? Prisma.sql`INNER JOIN maintenance_plan_task mpt ON wo."maintenancePlanTaskId" = mpt.id`
			: Prisma.sql``
		// PostgreSQL implicitly casts the text binding to the enum type on comparison
		const specialtyCondition = filters.specialty
			? Prisma.sql`AND mpt.specialty::text = ${filters.specialty}`
			: Prisma.sql``
		const taskTypeCondition = filters.taskType
			? Prisma.sql`AND mpt."taskType"::text = ${filters.taskType}`
			: Prisma.sql``

		const woWhere = buildWoWhere(filters)
		const wrWhere = buildWrWhere(filters)

		// Per-plan health filter: ignores dateFrom/dateTo (snapshot of NOW),
		// applies specialty/taskType/equipmentId structural filters.
		const taskBaseWhere: Prisma.MaintenancePlanTaskWhereInput = {
			isActive: true,
			maintenancePlan: { isActive: true },
			...(filters.maintenancePlanId ? { maintenancePlanId: filters.maintenancePlanId } : {}),
			...(filters.specialty ? { specialty: filters.specialty } : {}),
			...(filters.taskType ? { taskType: filters.taskType } : {}),
			...(filters.equipmentId
				? {
						OR: [
							{ equipmentId: filters.equipmentId },
							{ equipments: { some: { id: filters.equipmentId } } },
						],
					}
				: {}),
		}
		const now = new Date()

		const [
			totalPreventiveWOs,
			completedPreventiveWOs,
			totalTasksByPlan,
			overdueTasksByPlan,
			completedWOsWithDates,
			wosByMonthAndType,
			closureTimeData,
			monthlyWOStatus,
			wrResponseData,
		] = await Promise.all([
			// KPI 1 denominator: total PREVENTIVE WOs matching filters
			prisma.$queryRaw<[{ count: bigint }]>`
				SELECT COUNT(*)::bigint as count
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.type = 'PREVENTIVE'
					AND ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
			`.then((r) => Number(r[0]?.count ?? 0)),

			// KPI 1 numerator: completed PREVENTIVE WOs matching filters
			prisma.$queryRaw<[{ count: bigint }]>`
				SELECT COUNT(*)::bigint as count
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.type = 'PREVENTIVE'
					AND wo.status = 'COMPLETED'
					AND ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
			`.then((r) => Number(r[0]?.count ?? 0)),

			// KPI 1: per-plan task counts (active tasks per plan).
			prisma.maintenancePlanTask.groupBy({
				by: ["maintenancePlanId"],
				where: taskBaseWhere,
				_count: { _all: true },
			}),

			// KPI 1: per-plan overdue task counts (nextDate < now).
			prisma.maintenancePlanTask.groupBy({
				by: ["maintenancePlanId"],
				where: { ...taskBaseWhere, nextDate: { lt: now } },
				_count: { _all: true },
			}),

			// KPI 5 (on-time): completed WOs with endDate + estimatedEndDate
			prisma.$queryRaw<Array<{ endDate: Date; estimatedEndDate: Date }>>`
				SELECT wo."endDate", wo."estimatedEndDate"
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.status = 'COMPLETED'
					AND wo."endDate" IS NOT NULL
					AND wo."estimatedEndDate" IS NOT NULL
					AND ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
			`,

			// KPI 2: hours by month and type (prev vs corr)
			prisma.$queryRaw<Array<{ year: number; month: number; type: string; total_hours: number }>>`
				SELECT
					EXTRACT(YEAR FROM wo."programDate")::int as year,
					EXTRACT(MONTH FROM wo."programDate")::int as month,
					wo.type::text,
					COALESCE(SUM(wo."estimatedHours"), 0)::float as total_hours
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.type IN ('PREVENTIVE', 'CORRECTIVE')
					AND ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
				GROUP BY EXTRACT(YEAR FROM wo."programDate"), EXTRACT(MONTH FROM wo."programDate"), wo.type
				ORDER BY year, month
			`,

			// KPI 3: closure time — workBookStartDate → endDate (real operational duration)
			prisma.$queryRaw<Array<{ workBookStartDate: Date; endDate: Date }>>`
				SELECT wo."workBookStartDate", wo."endDate"
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.status = 'COMPLETED'
					AND wo."workBookStartDate" IS NOT NULL
					AND wo."endDate" IS NOT NULL
					AND ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
			`,

			// KPI 4: monthly WO status counts for backlog chart
			prisma.$queryRaw<
				Array<{ year: number; month: number; status: string; count: bigint; total_hours: number }>
			>`
				SELECT
					EXTRACT(YEAR FROM wo."programDate")::int as year,
					EXTRACT(MONTH FROM wo."programDate")::int as month,
					wo.status::text,
					COUNT(*)::bigint as count,
					COALESCE(SUM(wo."estimatedHours"), 0)::float as total_hours
				FROM work_order wo
				${taskJoinSql}
				WHERE ${woWhere}
					${specialtyCondition}
					${taskTypeCondition}
				GROUP BY EXTRACT(YEAR FROM wo."programDate"), EXTRACT(MONTH FROM wo."programDate"), wo.status
				ORDER BY year, month
			`,

			// KPI 6: work request response time
			prisma.$queryRaw<
				Array<{ year: number; month: number; avg_response_hours: number; count: bigint }>
			>`
				SELECT
					EXTRACT(YEAR FROM wr."createdAt")::int as year,
					EXTRACT(MONTH FROM wr."createdAt")::int as month,
					AVG(EXTRACT(EPOCH FROM (wo_first."createdAt" - wr."createdAt")) / 3600)::float as avg_response_hours,
					COUNT(*)::bigint as count
				FROM work_request wr
				INNER JOIN LATERAL (
					SELECT wo."createdAt"
					FROM work_order wo
					WHERE wo."workRequestId" = wr.id
						AND wo."deletedAt" IS NULL
					ORDER BY wo."createdAt" ASC
					LIMIT 1
				) wo_first ON true
				WHERE ${wrWhere}
				GROUP BY EXTRACT(YEAR FROM wr."createdAt"), EXTRACT(MONTH FROM wr."createdAt")
				ORDER BY year, month
			`,
		])

		// === KPI 1: Average Plan Health ===
		// Per-plan health = (totalTasks - overdueTasks) / totalTasks * 100.
		// Final value is the simple average across all plans with active tasks.
		const overdueByPlanMap = new Map(
			overdueTasksByPlan.map((p) => [p.maintenancePlanId, p._count._all])
		)

		const planHealthScores = totalTasksByPlan
			.filter((p) => p._count._all > 0)
			.map((p) => {
				const total = p._count._all
				const overdue = overdueByPlanMap.get(p.maintenancePlanId) ?? 0
				return Math.max(0, ((total - overdue) / total) * 100)
			})

		const compliancePercent =
			planHealthScores.length > 0
				? Math.round(planHealthScores.reduce((a, b) => a + b, 0) / planHealthScores.length)
				: 0
		const plansIncluded = planHealthScores.length

		// === KPI 2: Preventive vs Corrective Hours by Month ===
		const preventiveVsCorrectiveChart = buckets.map((b) => {
			const preventive =
				wosByMonthAndType.find(
					(r) => r.year === b.year && r.month === b.month && r.type === "PREVENTIVE"
				)?.total_hours ?? 0
			const corrective =
				// When specialty/taskType filter active, correctives are hidden per SPEC-005
				needsTaskJoin
					? 0
					: (wosByMonthAndType.find(
							(r) => r.year === b.year && r.month === b.month && r.type === "CORRECTIVE"
						)?.total_hours ?? 0)
			const total = preventive + corrective
			const ratio = total > 0 ? Math.round((preventive / total) * 100) : 0

			return {
				name: b.key,
				month: b.label,
				preventive: Math.round(preventive),
				corrective: Math.round(corrective),
				ratio,
			}
		})

		// === KPI 5: On Time vs Delayed ===
		let onTimeCount = 0
		let delayedCount = 0

		for (const wo of completedWOsWithDates) {
			if (wo.endDate && wo.estimatedEndDate) {
				if (new Date(wo.endDate) <= new Date(wo.estimatedEndDate)) {
					onTimeCount++
				} else {
					delayedCount++
				}
			}
		}

		const totalCompleted = onTimeCount + delayedCount
		const onTimePercent = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 0

		const onTimeChart = [
			{ name: "En fecha", value: onTimeCount, fill: "var(--color-green-500)" },
			{ name: "Atrasadas", value: delayedCount, fill: "var(--color-red-500)" },
		]

		// === KPI 3: Average Closure Time (workBookStartDate → endDate) ===
		let totalClosureMs = 0
		let closureCount = 0

		for (const wo of closureTimeData) {
			if (wo.workBookStartDate && wo.endDate) {
				const diff = new Date(wo.endDate).getTime() - new Date(wo.workBookStartDate).getTime()
				if (diff > 0) {
					totalClosureMs += diff
					closureCount++
				}
			}
		}

		const avgClosureHours =
			closureCount > 0
				? Math.round((totalClosureMs / closureCount / (1000 * 60 * 60)) * 10) / 10
				: 0
		const avgClosureDays = closureCount > 0 ? Math.round(avgClosureHours / HOURS_PER_DAY) : 0

		// === KPI 4: Backlog Chart ===
		// Backlog line is null when there's no closure data — chart renders a gap
		// instead of phantom numbers from a fallback denominator.
		const backlogReliable = avgClosureHours > 0

		const backlogChart = buckets.map((b) => {
			const monthData = monthlyWOStatus.filter((r) => r.year === b.year && r.month === b.month)

			const getCount = (status: string) =>
				Number(monthData.find((r) => r.status === status)?.count ?? BigInt(0))

			// D005: three meaningful buckets, CANCELLED excluded
			const pendientes = getCount("PLANNED") + getCount("PENDING")
			const enProgreso = getCount("IN_PROGRESS") + getCount("CLOSURE_REQUESTED")
			const completadas = getCount("COMPLETED")

			const pendingHours = monthData
				.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED")
				.reduce((sum, r) => sum + (r.total_hours || 0), 0)

			const backlog = backlogReliable
				? Math.round((pendingHours / avgClosureHours) * 10) / 10
				: null

			return {
				name: b.label,
				pendientes,
				enProgreso,
				completadas,
				backlog,
			}
		})

		// === KPI 6: Work Request Response Time ===
		const wrResponseChart = buckets.map((b) => {
			const data = wrResponseData.find((r) => r.year === b.year && r.month === b.month)
			return {
				name: b.label,
				avgHours: data ? Math.round(data.avg_response_hours * 10) / 10 : 0,
				count: data ? Number(data.count) : 0,
			}
		})

		// Weighted by WR count per month: Σ(avg_hours × count) / Σ(count).
		// Averaging the monthly averages directly would over-weight low-volume months.
		const { weightedSum, totalCount } = wrResponseData.reduce(
			(acc, r) => {
				const count = Number(r.count ?? 0)
				const hours = r.avg_response_hours || 0
				return {
					weightedSum: acc.weightedSum + hours * count,
					totalCount: acc.totalCount + count,
				}
			},
			{ weightedSum: 0, totalCount: 0 }
		)
		const avgWrResponseHours = totalCount > 0 ? Math.round((weightedSum / totalCount) * 10) / 10 : 0

		return NextResponse.json({
			cards: {
				compliancePercent,
				completedPreventiveWOs,
				totalPreventiveWOs,
				plansIncluded,
				onTimePercent,
				onTimeCount,
				delayedCount,
				avgClosureHours,
				avgClosureDays,
				avgWrResponseHours,
			},
			charts: {
				preventiveVsCorrective: preventiveVsCorrectiveChart,
				onTime: onTimeChart,
				backlog: backlogChart,
				wrResponse: wrResponseChart,
			},
		})
	} catch (error) {
		console.error("[MAINTENANCE_KPI_GET]", error)
		return NextResponse.json({ error: "Error al obtener indicadores" }, { status: 500 })
	}
}
