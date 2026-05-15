import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import ExcelJS from "exceljs"
import { z } from "zod"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { buildWoWhere } from "../_shared/where"

const HOURS_PER_DAY = 8

// ─── Input validation (mirrors /api/maintenance-plan/kpi) ────────────────────

const TASK_SPECIALTY_VALUES = [
	"ELECTRIC",
	"MECHANIC",
	"INSTRUMENTATION_CONTROL",
	"HYDRAULIC",
] as const
const TASK_TYPE_VALUES = ["CLEANING", "INSPECTION", "LUBRICATION", "ADJUSTMENTS"] as const

const SPECIALTY_LABELS: Record<string, string> = {
	ELECTRIC: "Eléctrica",
	MECHANIC: "Mecánica",
	INSTRUMENTATION_CONTROL: "Instrumentación y Control",
	HYDRAULIC: "Hidráulica",
}

const TASK_TYPE_LABELS: Record<string, string> = {
	CLEANING: "Limpieza",
	INSPECTION: "Inspección",
	LUBRICATION: "Lubricación",
	ADJUSTMENTS: "Ajustes",
}

const WO_STATUS_LABELS: Record<string, string> = {
	PLANNED: "Planificada",
	PENDING: "Pendiente",
	IN_PROGRESS: "En Progreso",
	CLOSURE_REQUESTED: "Cierre Solicitado",
	COMPLETED: "Completada",
	CANCELLED: "Cancelada",
}

const WO_TYPE_LABELS: Record<string, string> = {
	PREVENTIVE: "Preventiva",
	CORRECTIVE: "Correctiva",
}

const WR_STATUS_LABELS: Record<string, string> = {
	REPORTED: "Reportada",
	APPROVED: "Aprobada",
	REJECTED: "Rechazada",
	ASSIGNED: "Asignada",
	CLOSED: "Cerrada",
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWrWhere(f: Filters): Prisma.Sql {
	const parts: Prisma.Sql[] = [Prisma.sql`1=1`]
	if (f.dateFrom) parts.push(Prisma.sql`wr."createdAt" >= ${f.dateFrom}`)
	if (f.dateTo) parts.push(Prisma.sql`wr."createdAt" <= ${f.dateTo}`)
	return Prisma.join(parts, " AND ")
}

interface MonthBucket {
	key: string
	label: string
	year: number
	month: number
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

function fmtDate(d: Date | null | undefined): string {
	if (!d) return ""
	return d.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const sp = request.nextUrl.searchParams
	const parsed = filtersSchema.safeParse({
		dateFrom: sp.get("dateFrom") || null,
		dateTo: sp.get("dateTo") || null,
		specialty: sp.get("specialty") || null,
		taskType: sp.get("taskType") || null,
		equipmentId: sp.get("equipmentId") || null,
		maintenancePlanId: sp.get("maintenancePlanId") || null,
	})
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
		// ─── Bucketing range (matches /api/maintenance-plan/kpi) ──────────────
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

		// Resolve plan name for the "Resumen" sheet (only when filter is active)
		const planNameForLabel = filters.maintenancePlanId
			? ((
					await prisma.maintenancePlan.findUnique({
						where: { id: filters.maintenancePlanId },
						select: { name: true },
					})
				)?.name ?? filters.maintenancePlanId)
			: null

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

		const woWhere = buildWoWhere(filters)
		const wrWhere = buildWrWhere(filters)

		// ─── Prisma where inputs for raw data ─────────────────────────────────
		const programDateRange: Prisma.DateTimeFilter | undefined =
			filters.dateFrom || filters.dateTo
				? {
						...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
						...(filters.dateTo ? { lte: filters.dateTo } : {}),
					}
				: undefined

		const woRawWhere: Prisma.WorkOrderWhereInput = {
			deletedAt: null,
			...(programDateRange ? { programDate: programDateRange } : {}),
			...(filters.equipmentId ? { equipments: { some: { id: filters.equipmentId } } } : {}),
			...(filters.specialty || filters.taskType || filters.maintenancePlanId
				? {
						MaintenancePlanTask: {
							is: {
								...(filters.specialty ? { specialty: filters.specialty } : {}),
								...(filters.taskType ? { taskType: filters.taskType } : {}),
								...(filters.maintenancePlanId
									? { maintenancePlanId: filters.maintenancePlanId }
									: {}),
							},
						},
					}
				: {}),
		}

		const wrCreatedRange: Prisma.DateTimeFilter | undefined =
			filters.dateFrom || filters.dateTo
				? {
						...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
						...(filters.dateTo ? { lte: filters.dateTo } : {}),
					}
				: undefined

		const wrRawWhere: Prisma.WorkRequestWhereInput = {
			...(wrCreatedRange ? { createdAt: wrCreatedRange } : {}),
			...(filters.equipmentId ? { equipments: { some: { id: filters.equipmentId } } } : {}),
		}

		// Per-plan health filter: ignores dateFrom/dateTo (snapshot of NOW),
		// applies specialty/taskType/equipmentId/maintenancePlanId structural filters.
		const taskBaseWhere: Prisma.MaintenancePlanTaskWhereInput = {
			isActive: true,
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

		// ─── Parallel data fetch ──────────────────────────────────────────────
		const [
			plansWithHealthTasks,
			completedWOsWithDates,
			wosByMonthAndType,
			closureTimeData,
			monthlyWOStatus,
			wrResponseData,
			rawWorkOrders,
			rawWorkRequests,
		] = await Promise.all([
			prisma.maintenancePlan.findMany({
				where: {
					isActive: true,
					...(filters.maintenancePlanId ? { id: filters.maintenancePlanId } : {}),
					task: { some: taskBaseWhere },
				},
				select: {
					id: true,
					name: true,
					task: {
						where: taskBaseWhere,
						select: { id: true, nextDate: true },
					},
				},
				orderBy: { name: "asc" },
			}),

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

			prisma.workOrder.findMany({
				where: woRawWhere,
				orderBy: { programDate: "desc" },
				select: {
					otNumber: true,
					type: true,
					status: true,
					priority: true,
					programDate: true,
					estimatedEndDate: true,
					endDate: true,
					workBookStartDate: true,
					estimatedHours: true,
					workDescription: true,
					company: { select: { name: true } },
					supervisor: { select: { name: true } },
					responsible: { select: { name: true } },
					equipments: { select: { name: true } },
					MaintenancePlanTask: {
						select: {
							name: true,
							specialty: true,
							taskType: true,
							maintenancePlan: { select: { name: true } },
						},
					},
				},
			}),

			prisma.workRequest.findMany({
				where: wrRawWhere,
				orderBy: { createdAt: "desc" },
				select: {
					requestNumber: true,
					createdAt: true,
					isUrgent: true,
					status: true,
					workType: true,
					description: true,
					operator: { select: { name: true } },
					user: { select: { name: true } },
					equipments: { select: { name: true } },
					workOrders: {
						orderBy: { createdAt: "asc" },
						take: 1,
						select: { otNumber: true, createdAt: true },
					},
				},
			}),
		])

		// ─── Aggregates (match /api/maintenance-plan/kpi) ─────────────────────

		const planRows = plansWithHealthTasks.map((plan) => {
			const total = plan.task.length
			const overdue = plan.task.filter((t) => new Date(t.nextDate) < now).length
			const percent = total > 0 ? Math.max(0, ((total - overdue) / total) * 100) : 0
			return { planName: plan.name, total, overdue, percent }
		})
		const planRatios = planRows.filter((r) => r.total > 0).map((r) => r.percent)
		const compliancePercent =
			planRatios.length > 0
				? Math.round(planRatios.reduce((a, b) => a + b, 0) / planRatios.length)
				: 0

		let onTimeCount = 0
		let delayedCount = 0
		for (const wo of completedWOsWithDates) {
			if (wo.endDate && wo.estimatedEndDate) {
				if (new Date(wo.endDate) <= new Date(wo.estimatedEndDate)) onTimeCount++
				else delayedCount++
			}
		}
		const totalCompleted = onTimeCount + delayedCount
		const onTimePercent = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 0

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
			closureCount > 0 ? Math.round((totalClosureMs / closureCount / 3_600_000) * 10) / 10 : 0
		const avgClosureDays = closureCount > 0 ? Math.round(avgClosureHours / HOURS_PER_DAY) : 0
		const backlogReliable = avgClosureHours > 0

		const prevVsCorrRows = buckets.map((b) => {
			const preventive =
				wosByMonthAndType.find(
					(r) => r.year === b.year && r.month === b.month && r.type === "PREVENTIVE"
				)?.total_hours ?? 0
			const corrective = needsTaskJoin
				? 0
				: (wosByMonthAndType.find(
						(r) => r.year === b.year && r.month === b.month && r.type === "CORRECTIVE"
					)?.total_hours ?? 0)
			const total = preventive + corrective
			return {
				month: b.label,
				preventive: Math.round(preventive),
				corrective: Math.round(corrective),
				ratio: total > 0 ? Math.round((preventive / total) * 100) : 0,
			}
		})

		const backlogRows = buckets.map((b) => {
			const monthData = monthlyWOStatus.filter((r) => r.year === b.year && r.month === b.month)
			const getCount = (status: string) =>
				Number(monthData.find((r) => r.status === status)?.count ?? BigInt(0))
			const pendientes = getCount("PLANNED") + getCount("PENDING")
			const enProgreso = getCount("IN_PROGRESS") + getCount("CLOSURE_REQUESTED")
			const completadas = getCount("COMPLETED")
			const pendingHours = monthData
				.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED")
				.reduce((sum, r) => sum + (r.total_hours || 0), 0)
			const backlog = backlogReliable
				? Math.round((pendingHours / avgClosureHours) * 10) / 10
				: null
			return { month: b.label, pendientes, enProgreso, completadas, backlog }
		})

		const wrMonthlyRows = buckets.map((b) => {
			const d = wrResponseData.find((r) => r.year === b.year && r.month === b.month)
			return {
				month: b.label,
				avgHours: d ? Math.round(d.avg_response_hours * 10) / 10 : 0,
				count: d ? Number(d.count) : 0,
			}
		})

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
		const avgWrResponseHours =
			totalCount > 0 ? Math.round((weightedSum / totalCount) * 10) / 10 : 0

		// ─── Build workbook ───────────────────────────────────────────────────
		const wb = new ExcelJS.Workbook()
		wb.creator = "IS 360"
		wb.created = new Date()

		const headerFill = "FF4F46E5" // indigo-600
		const headerFont = "FFFFFFFF"

		const styleHeader = (ws: ExcelJS.Worksheet) => {
			const row = ws.getRow(1)
			row.font = { bold: true, color: { argb: headerFont } }
			row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerFill } }
			row.height = 22
			row.alignment = { vertical: "middle", horizontal: "left" }
			ws.views = [{ state: "frozen", ySplit: 1 }]
			if (ws.rowCount > 1 && ws.columnCount > 0) {
				ws.autoFilter = {
					from: { row: 1, column: 1 },
					to: { row: ws.rowCount, column: ws.columnCount },
				}
			}
		}

		// Sheet 1: Resumen
		{
			const ws = wb.addWorksheet("Resumen")
			ws.columns = [
				{ header: "Indicador", key: "k", width: 45 },
				{ header: "Valor", key: "v", width: 40 },
			]
			ws.addRows([
				{ k: "Exportado", v: new Date().toLocaleString("es-CL") },
				{
					k: "Período",
					v:
						filters.dateFrom && filters.dateTo
							? `${filters.dateFrom.toLocaleDateString("es-CL")} — ${filters.dateTo.toLocaleDateString("es-CL")}`
							: "Sin filtro",
				},
				{
					k: "Especialidad",
					v: filters.specialty ? SPECIALTY_LABELS[filters.specialty] : "Todas",
				},
				{
					k: "Tipo de tarea",
					v: filters.taskType ? TASK_TYPE_LABELS[filters.taskType] : "Todos",
				},
				{ k: "Equipo", v: filters.equipmentId ?? "Todos" },
				{ k: "Plan de Mantenimiento", v: planNameForLabel ?? "Todos" },
				{ k: "", v: "" },
				{
					k: "Salud Promedio de Planes",
					v: `${compliancePercent}% (${planRatios.length} ${planRatios.length === 1 ? "plan" : "planes"})`,
				},
				{
					k: "OTs en Fecha",
					v: `${onTimePercent}% (${onTimeCount} en fecha / ${delayedCount} atrasadas)`,
				},
				{
					k: "Tiempo Prom. Cierre",
					v: `${avgClosureDays} días (~${avgClosureHours} h hábiles)`,
				},
				{ k: "Respuesta Promedio a WRs", v: `${avgWrResponseHours} h` },
			])
			styleHeader(ws)
		}

		// Sheet 2: Salud por Plan
		{
			const ws = wb.addWorksheet("Salud por Plan")
			ws.columns = [
				{ header: "Plan de Mantenimiento", key: "plan", width: 40 },
				{ header: "Total Tareas Activas", key: "total", width: 22 },
				{ header: "Tareas Vencidas", key: "overdue", width: 20 },
				{ header: "% Salud", key: "percent", width: 18 },
			]
			planRows.forEach((r) => {
				ws.addRow({
					plan: r.planName,
					total: r.total,
					overdue: r.overdue,
					percent: Math.round(r.percent),
				})
			})
			styleHeader(ws)
		}

		// Sheet 3: OTs (Crudo)
		{
			const ws = wb.addWorksheet("OTs (Crudo)")
			ws.columns = [
				{ header: "N° OT", key: "otNumber", width: 14 },
				{ header: "Tipo", key: "type", width: 14 },
				{ header: "Estado", key: "status", width: 18 },
				{ header: "Prioridad", key: "priority", width: 12 },
				{ header: "Fecha Programada", key: "programDate", width: 18 },
				{ header: "Fecha Est. Cierre", key: "estEnd", width: 18 },
				{ header: "Fecha Real Cierre", key: "realEnd", width: 18 },
				{ header: "En Fecha", key: "onTime", width: 10 },
				{ header: "Horas Est.", key: "hours", width: 12 },
				{ header: "Empresa", key: "company", width: 28 },
				{ header: "Supervisor", key: "supervisor", width: 24 },
				{ header: "Responsable", key: "responsible", width: 24 },
				{ header: "Plan", key: "plan", width: 30 },
				{ header: "Tarea del Plan", key: "task", width: 30 },
				{ header: "Especialidad", key: "specialty", width: 18 },
				{ header: "Tipo de Tarea", key: "taskType", width: 16 },
				{ header: "Equipos", key: "equipments", width: 40 },
				{ header: "Descripción", key: "description", width: 50 },
			]
			rawWorkOrders.forEach((wo) => {
				const onTime =
					wo.status === "COMPLETED" && wo.endDate && wo.estimatedEndDate
						? new Date(wo.endDate) <= new Date(wo.estimatedEndDate)
							? "Sí"
							: "No"
						: ""
				ws.addRow({
					otNumber: wo.otNumber,
					type: WO_TYPE_LABELS[wo.type] ?? wo.type,
					status: WO_STATUS_LABELS[wo.status] ?? wo.status,
					priority: wo.priority,
					programDate: fmtDate(wo.programDate),
					estEnd: fmtDate(wo.estimatedEndDate),
					realEnd: fmtDate(wo.endDate),
					onTime,
					hours: wo.estimatedHours,
					company: wo.company?.name ?? "",
					supervisor: wo.supervisor?.name ?? "",
					responsible: wo.responsible?.name ?? "",
					plan: wo.MaintenancePlanTask?.maintenancePlan?.name ?? "",
					task: wo.MaintenancePlanTask?.name ?? "",
					specialty: wo.MaintenancePlanTask?.specialty
						? (SPECIALTY_LABELS[wo.MaintenancePlanTask.specialty] ??
							wo.MaintenancePlanTask.specialty)
						: "",
					taskType: wo.MaintenancePlanTask?.taskType
						? (TASK_TYPE_LABELS[wo.MaintenancePlanTask.taskType] ??
							wo.MaintenancePlanTask.taskType)
						: "",
					equipments: wo.equipments.map((e) => e.name).join(", "),
					description: wo.workDescription ?? "",
				})
			})
			styleHeader(ws)
		}

		// Sheet 4: Work Requests (Crudo)
		{
			const ws = wb.addWorksheet("WRs (Crudo)")
			ws.columns = [
				{ header: "N° Solicitud", key: "n", width: 14 },
				{ header: "Fecha", key: "date", width: 18 },
				{ header: "Urgente", key: "urgent", width: 10 },
				{ header: "Estado", key: "status", width: 14 },
				{ header: "Tipo", key: "type", width: 16 },
				{ header: "Solicitante", key: "user", width: 24 },
				{ header: "Operador", key: "operator", width: 24 },
				{ header: "Equipos", key: "equipments", width: 40 },
				{ header: "N° Primera OT", key: "firstWo", width: 16 },
				{ header: "Horas hasta 1ra OT", key: "responseHours", width: 20 },
				{ header: "Descripción", key: "description", width: 50 },
			]
			rawWorkRequests.forEach((wr) => {
				const first = wr.workOrders[0]
				const responseHours = first
					? Math.round(
							((new Date(first.createdAt).getTime() - new Date(wr.createdAt).getTime()) /
								3_600_000) *
								10
						) / 10
					: ""
				ws.addRow({
					n: wr.requestNumber,
					date: fmtDate(wr.createdAt),
					urgent: wr.isUrgent ? "Sí" : "No",
					status: WR_STATUS_LABELS[wr.status] ?? wr.status,
					type: wr.workType ?? "",
					user: wr.user?.name ?? "",
					operator: wr.operator?.name ?? "",
					equipments: wr.equipments.map((e) => e.name).join(", "),
					firstWo: first?.otNumber ?? "",
					responseHours,
					description: wr.description,
				})
			})
			styleHeader(ws)
		}

		// Sheet 5: Prev vs Correctivo (Mensual)
		{
			const ws = wb.addWorksheet("Prev vs Correctivo")
			ws.columns = [
				{ header: "Mes", key: "month", width: 18 },
				{ header: "Horas Preventivas", key: "preventive", width: 20 },
				{ header: "Horas Correctivas", key: "corrective", width: 20 },
				{ header: "Ratio Preventivo %", key: "ratio", width: 18 },
			]
			prevVsCorrRows.forEach((r) => ws.addRow(r))
			styleHeader(ws)
		}

		// Sheet 6: OTs en Fecha
		{
			const ws = wb.addWorksheet("OTs en Fecha")
			ws.columns = [
				{ header: "Categoría", key: "k", width: 22 },
				{ header: "Cantidad", key: "v", width: 14 },
			]
			ws.addRows([
				{ k: "En fecha", v: onTimeCount },
				{ k: "Atrasadas", v: delayedCount },
				{ k: "Total completadas", v: totalCompleted },
				{ k: "% En fecha", v: onTimePercent },
			])
			styleHeader(ws)
		}

		// Sheet 7: Backlog Mensual
		{
			const ws = wb.addWorksheet("Backlog Mensual")
			ws.columns = [
				{ header: "Mes", key: "month", width: 18 },
				{ header: "Pendientes", key: "pendientes", width: 14 },
				{ header: "En Progreso", key: "enProgreso", width: 14 },
				{ header: "Completadas", key: "completadas", width: 14 },
				{ header: "Backlog (meses)", key: "backlog", width: 16 },
			]
			backlogRows.forEach((r) =>
				ws.addRow({ ...r, backlog: r.backlog === null ? "s/datos" : r.backlog })
			)
			styleHeader(ws)
		}

		// Sheet 8: Respuesta WRs (Mensual)
		{
			const ws = wb.addWorksheet("Respuesta WRs")
			ws.columns = [
				{ header: "Mes", key: "month", width: 18 },
				{ header: "Horas Promedio", key: "avgHours", width: 18 },
				{ header: "Cantidad WRs", key: "count", width: 16 },
			]
			wrMonthlyRows.forEach((r) => ws.addRow(r))
			styleHeader(ws)
		}

		const buffer = await wb.xlsx.writeBuffer()
		const today = new Date().toISOString().slice(0, 10)
		const filename = `indicadores-mantenimiento-${today}.xlsx`

		return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
			status: 200,
			headers: {
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		})
	} catch (error) {
		console.error("[MAINTENANCE_KPI_EXPORT_GET]", error)
		return NextResponse.json({ error: "Error al exportar indicadores" }, { status: 500 })
	}
}
