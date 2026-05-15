import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { buildWoWhere } from "../_shared/where"
import type { DrillDownRow, DrillDownResponse } from "@/project/maintenance-plan/types/kpi-drill-down"

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_SPECIALTY_VALUES = [
	"ELECTRIC",
	"MECHANIC",
	"INSTRUMENTATION_CONTROL",
	"HYDRAULIC",
] as const

const TASK_TYPE_VALUES = ["CLEANING", "INSPECTION", "LUBRICATION", "ADJUSTMENTS"] as const

// ─── Input schema (Task 1.3) ──────────────────────────────────────────────────

export const drillDownInputSchema = z
	.object({
		segment: z.enum(["on-time:late", "on-time:ontime"]),
		dateFrom: z.iso.datetime({ offset: true }).nullish(),
		dateTo: z.iso.datetime({ offset: true }).nullish(),
		specialty: z.enum(TASK_SPECIALTY_VALUES).nullish(),
		taskType: z.enum(TASK_TYPE_VALUES).nullish(),
		equipmentId: z.string().min(1).nullish(),
		maintenancePlanId: z.string().min(1).nullish(),
		page: z.coerce.number().int().min(1).default(1),
		pageSize: z.coerce.number().int().min(1).max(2000).default(50),
		sortBy: z
			.enum(["delayDays", "estimatedEndDate", "endDate", "otNumber"])
			.default("delayDays"),
		sortDir: z.enum(["asc", "desc"]).default("desc"),
	})
	.strict()

// ─── Raw row type from $queryRaw ──────────────────────────────────────────────

interface RawDrillDownRow {
	id: string
	code: string
	equipment_name: string | null
	equipment_id: string | null
	scheduled_date: Date | null
	end_date: Date | null
	delay_days: number
	status: string
	specialty: string | null
	responsible_name: string | null
	created_at: Date
	has_no_activity: boolean
}

// ─── Helper: map sortBy → SQL column expression ───────────────────────────────

function sortByToSql(sortBy: string): Prisma.Sql {
	switch (sortBy) {
		case "delayDays":
			return Prisma.sql`delay_days`
		case "estimatedEndDate":
			return Prisma.sql`wo."estimatedEndDate"`
		case "endDate":
			return Prisma.sql`wo."endDate"`
		case "otNumber":
			return Prisma.sql`wo."otNumber"`
		default:
			return Prisma.sql`delay_days`
	}
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
	const rawParams = Object.fromEntries(sp.entries())

	const parsed = drillDownInputSchema.safeParse(rawParams)
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
	}

	const {
		segment,
		dateFrom: rawDateFrom,
		dateTo: rawDateTo,
		specialty,
		taskType,
		equipmentId,
		maintenancePlanId,
		page,
		pageSize,
		sortBy,
		sortDir,
	} = parsed.data

	const filters = {
		dateFrom: rawDateFrom ? new Date(rawDateFrom) : null,
		dateTo: rawDateTo ? new Date(rawDateTo) : null,
		specialty: specialty ?? null,
		taskType: taskType ?? null,
		equipmentId: equipmentId ?? null,
		maintenancePlanId: maintenancePlanId ?? null,
	}

	try {
		const offset = (page - 1) * pageSize

		// Build base WHERE for filters (programDate range, equipment, specialty/taskType)
		const woWhere = buildWoWhere(filters)

		// Build segment WHERE branch
		const segmentCondition =
			segment === "on-time:late"
				? Prisma.sql`wo."endDate" > wo."estimatedEndDate"`
				: Prisma.sql`wo."endDate" <= wo."estimatedEndDate"`

		// Build task join + specialty/taskType conditions (mirrors existing kpi route)
		const needsTaskJoin = !!(filters.specialty || filters.taskType || filters.maintenancePlanId)
		const taskJoinSql = needsTaskJoin
			? Prisma.sql`INNER JOIN maintenance_plan_task mpt ON wo."maintenancePlanTaskId" = mpt.id`
			: Prisma.sql``
		const specialtyCondition = filters.specialty
			? Prisma.sql`AND mpt.specialty::text = ${filters.specialty}`
			: Prisma.sql``
		const taskTypeCondition = filters.taskType
			? Prisma.sql`AND mpt."taskType"::text = ${filters.taskType}`
			: Prisma.sql``

		// Sort direction
		const sortDirSql =
			sortDir === "asc" ? Prisma.sql`ASC NULLS LAST` : Prisma.sql`DESC NULLS LAST`
		const sortBySql = sortByToSql(sortBy)

		// delayDays as an expression used in SELECT and ORDER BY
		// CEIL((endDate - estimatedEndDate) in seconds / 86400)
		const delayDaysExpr = Prisma.sql`
			COALESCE(
				CEIL(EXTRACT(EPOCH FROM (wo."endDate" - wo."estimatedEndDate")) / 86400)::int,
				0
			)
		`

		const [rows, countResult] = await Promise.all([
			prisma.$queryRaw<RawDrillDownRow[]>`
				SELECT
					wo.id,
					wo."otNumber" AS code,
					eq.name AS equipment_name,
					eq.id AS equipment_id,
					wo."estimatedEndDate" AS scheduled_date,
					wo."endDate" AS end_date,
					${delayDaysExpr} AS delay_days,
					wo.status::text AS status,
					mpt2.specialty::text AS specialty,
					u.name AS responsible_name,
					wo."createdAt" AS created_at,
					NOT EXISTS (
						SELECT 1 FROM work_book_entry wbe
						WHERE wbe."workOrderId" = wo.id
							AND wbe."entryType" IN ('DAILY_ACTIVITY', 'ADDITIONAL_ACTIVITY')
					) AS has_no_activity
				FROM work_order wo
				${taskJoinSql}
				LEFT JOIN maintenance_plan_task mpt2 ON wo."maintenancePlanTaskId" = mpt2.id
				LEFT JOIN LATERAL (
					SELECT e.id, e.name
					FROM "_EquipmentToWorkOrder" pivot
					INNER JOIN equipment e ON e.id = pivot."A"
					WHERE pivot."B" = wo.id
					ORDER BY e.name ASC
					LIMIT 1
				) eq ON true
				LEFT JOIN "user" u ON u.id = wo."responsibleId"
				WHERE wo.status = 'COMPLETED'
					AND wo."endDate" IS NOT NULL
					AND wo."estimatedEndDate" IS NOT NULL
					AND ${woWhere}
					AND ${segmentCondition}
					${specialtyCondition}
					${taskTypeCondition}
				ORDER BY ${sortBySql} ${sortDirSql}
				LIMIT ${pageSize}
				OFFSET ${offset}
			`,
			prisma.$queryRaw<[{ count: bigint }]>`
				SELECT COUNT(*)::bigint AS count
				FROM work_order wo
				${taskJoinSql}
				WHERE wo.status = 'COMPLETED'
					AND wo."endDate" IS NOT NULL
					AND wo."estimatedEndDate" IS NOT NULL
					AND ${woWhere}
					AND ${segmentCondition}
					${specialtyCondition}
					${taskTypeCondition}
			`,
		])

		const total = Number(countResult[0]?.count ?? 0)

		const items: DrillDownRow[] = rows.map((r) => ({
			id: r.id,
			code: r.code,
			equipmentName: r.equipment_name,
			equipmentId: r.equipment_id,
			scheduledDate: r.scheduled_date ? r.scheduled_date.toISOString() : "",
			endDate: r.end_date ? r.end_date.toISOString() : null,
			delayDays: Number(r.delay_days),
			status: r.status as DrillDownRow["status"],
			specialty: r.specialty as DrillDownRow["specialty"],
			responsibleName: r.responsible_name,
			createdAt: r.created_at.toISOString(),
			hasNoActivity: r.has_no_activity,
		}))

		const response: DrillDownResponse = {
			items,
			total,
			page,
			pageSize,
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error("[MAINTENANCE_KPI_DRILL_DOWN_GET]", error)
		return NextResponse.json({ error: "Error al obtener detalle del indicador" }, { status: 500 })
	}
}
