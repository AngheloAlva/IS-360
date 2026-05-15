import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { TIMELINE_EVENT_TYPES } from "@/project/equipment/types/equipment-timeline"
import type {
	EquipmentTimelineEvent,
	EquipmentTimelineResponse,
	WorkOrderTimelineEvent,
	WorkRequestTimelineEvent,
} from "@/project/equipment/types/equipment-timeline"

// ─── Query param schema ───────────────────────────────────────────────────────

const querySchema = z.object({
	cursor: z.string().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(200).default(100),
})

// ─── Composite cursor helpers ─────────────────────────────────────────────────

interface CompositeCursor {
	date: Date
	id: string
}

function parseCursor(raw: string): CompositeCursor | null {
	const sep = raw.lastIndexOf("|")
	if (sep === -1) return null
	const datePart = raw.slice(0, sep)
	const idPart = raw.slice(sep + 1)
	const date = new Date(datePart)
	if (isNaN(date.getTime()) || !idPart) return null
	return { date, id: idPart }
}

function encodeCursor(date: string, id: string): string {
	return `${date}|${id}`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		// Validate query params
		const parsed = querySchema.safeParse(
			Object.fromEntries(req.nextUrl.searchParams.entries())
		)

		if (!parsed.success) {
			return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
		}

		const { cursor, limit } = parsed.data

		// Parse composite cursor "<isoDate>|<id>"
		const compositeCursor = cursor ? parseCursor(cursor) : null
		if (cursor && !compositeCursor) {
			return NextResponse.json({ error: "Cursor inválido" }, { status: 400 })
		}

		// Verify equipment exists
		const equipment = await prisma.equipment.findUnique({
			where: { id },
			select: { id: true },
		})

		if (!equipment) {
			return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
		}

		// Composite cursor filter: events strictly before cursor date, OR same date with id < cursor id (desc sort)
		const wrCursorFilter = compositeCursor
			? {
					OR: [
						{ requestDate: { lt: compositeCursor.date } },
						{ requestDate: compositeCursor.date, id: { lt: compositeCursor.id } },
					],
				}
			: {}

		const woCursorFilter = compositeCursor
			? {
					OR: [
						{ solicitationDate: { lt: compositeCursor.date } },
						{ solicitationDate: compositeCursor.date, id: { lt: compositeCursor.id } },
					],
				}
			: {}

		// Run both queries in parallel
		const [workRequests, workOrders] = await Promise.all([
			prisma.workRequest.findMany({
				where: {
					equipments: { some: { id } },
					...wrCursorFilter,
				},
				select: {
					id: true,
					requestNumber: true,
					description: true,
					isUrgent: true,
					requestDate: true,
					status: true,
					operator: { select: { id: true, name: true } },
				},
				orderBy: [{ requestDate: "desc" }, { id: "desc" }],
				take: limit + 1,
			}),
			prisma.workOrder.findMany({
				where: {
					deletedAt: null,
					equipments: { some: { id } },
					...woCursorFilter,
				},
				select: {
					id: true,
					otNumber: true,
					workRequest: true,
					workDescription: true,
					type: true,
					status: true,
					priority: true,
					capex: true,
					solicitationDate: true,
					workRequestId: true,
					maintenancePlanTaskId: true,
					MaintenancePlanTask: {
						select: { id: true, name: true },
					},
					responsible: { select: { id: true, name: true } },
					_count: {
						select: {
							milestones: true,
							workBookEntries: true,
						},
					},
				},
				orderBy: [{ solicitationDate: "desc" }, { id: "desc" }],
				take: limit + 1,
			}),
		])

		// Fetch inspection counts grouped by workOrderId
		const workOrderIds = workOrders.map((wo) => wo.id)
		const inspectionGroups = workOrderIds.length
			? await prisma.workEntry.groupBy({
					by: ["workOrderId"],
					where: {
						workOrderId: { in: workOrderIds },
						entryType: "OTC_INSPECTION",
					},
					_count: { id: true },
				})
			: []

		const inspectionCountByWorkOrderId = new Map(
			inspectionGroups.map((g) => [g.workOrderId, g._count.id])
		)

		// Map to unified timeline events
		const wrEvents: WorkRequestTimelineEvent[] = workRequests.map((wr) => ({
			id: wr.id,
			type: TIMELINE_EVENT_TYPES.WORK_REQUEST,
			date: wr.requestDate.toISOString(),
			title: wr.description,
			parentWorkRequestId: null,
			parentPlanTaskId: null,
			planName: null,
			responsible: wr.operator
				? { id: wr.operator.id, name: wr.operator.name ?? "" }
				: null,
			status: wr.status,
			workRequestNumber: wr.requestNumber,
			isUrgent: wr.isUrgent,
			workOrderType: null,
			capex: null,
			counts: null,
		}))

		const woEvents: WorkOrderTimelineEvent[] = workOrders.map((wo) => ({
			id: wo.id,
			type: TIMELINE_EVENT_TYPES.WORK_ORDER,
			date: wo.solicitationDate.toISOString(),
			title: wo.workDescription ?? wo.workRequest,
			parentWorkRequestId: wo.workRequestId ?? null,
			parentPlanTaskId: wo.maintenancePlanTaskId ?? null,
			planName: wo.MaintenancePlanTask?.name ?? null,
			responsible: wo.responsible
				? { id: wo.responsible.id, name: wo.responsible.name ?? "" }
				: null,
			status: wo.status,
			otNumber: wo.otNumber,
			workOrderType: wo.type,
			priority: wo.priority,
			capex: wo.capex ?? null,
			counts: {
				milestones: wo._count.milestones,
				workEntries: wo._count.workBookEntries,
				inspections: inspectionCountByWorkOrderId.get(wo.id) ?? 0,
			},
		}))

		// Merge and sort descending by date, then id
		const merged: EquipmentTimelineEvent[] = [...wrEvents, ...woEvents].sort((a, b) => {
			const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
			if (diff !== 0) return diff
			return b.id > a.id ? 1 : -1
		})

		// Cursor pagination: slice to limit, emit composite cursor from last event
		const hasMore = merged.length > limit
		const sliced = hasMore ? merged.slice(0, limit) : merged
		const lastEvent = sliced[sliced.length - 1]
		const nextCursor = hasMore && lastEvent
			? encodeCursor(lastEvent.date, lastEvent.id)
			: null

		const response: EquipmentTimelineResponse = {
			events: sliced,
			nextCursor,
			hasMore,
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error("[EQUIPMENT_TIMELINE_GET]", error)
		return NextResponse.json(
			{ error: "Error al obtener historial del equipo" },
			{ status: 500 }
		)
	}
}
