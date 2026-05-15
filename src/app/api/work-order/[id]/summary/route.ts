import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkOrderSummaryResponse } from "@/project/work-order/types/work-order-summary"

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
	_req: NextRequest,
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

		const workOrder = await prisma.workOrder.findFirst({
			where: { id, deletedAt: null },
			select: {
				id: true,
				otNumber: true,
				workRequest: true,
				workDescription: true,
				type: true,
				status: true,
				priority: true,
				capex: true,
				programDate: true,
				estimatedEndDate: true,
				solicitationDate: true,
				workRequestId: true,
				maintenancePlanTaskId: true,
				responsible: { select: { id: true, name: true } },
				supervisor: { select: { id: true, name: true } },
				workRequested: {
					select: { id: true, requestNumber: true },
				},
				MaintenancePlanTask: {
					select: { id: true, name: true },
				},
				_count: {
					select: {
						milestones: true,
						workBookEntries: true,
					},
				},
				milestones: {
					select: {
						id: true,
						name: true,
						status: true,
						startDate: true,
						endDate: true,
					},
					orderBy: { order: "asc" },
					take: 5,
				},
				workBookEntries: {
					where: {
						entryType: { not: "OTC_INSPECTION" },
					},
					select: {
						id: true,
						activityName: true,
						executionDate: true,
						entryType: true,
					},
					orderBy: { executionDate: "desc" },
					take: 5,
				},
			},
		})

		if (!workOrder) {
			return NextResponse.json(
				{ error: "Orden de trabajo no encontrada" },
				{ status: 404 }
			)
		}

		// Fetch inspection count and top-5 separately (filtered _count not possible in a single select for count+top5 simultaneously)
		const [inspectionCount, inspections] = await Promise.all([
			prisma.workEntry.count({
				where: { workOrderId: id, entryType: "OTC_INSPECTION" },
			}),
			prisma.workEntry.findMany({
				where: { workOrderId: id, entryType: "OTC_INSPECTION" },
				select: {
					id: true,
					activityName: true,
					executionDate: true,
				},
				orderBy: { executionDate: "desc" },
				take: 5,
			}),
		])

		const response: WorkOrderSummaryResponse = {
			id: workOrder.id,
			otNumber: workOrder.otNumber,
			workRequest: workOrder.workRequest,
			workDescription: workOrder.workDescription ?? null,
			type: workOrder.type,
			status: workOrder.status,
			priority: workOrder.priority,
			capex: workOrder.capex ?? null,
			programDate: workOrder.programDate.toISOString(),
			estimatedEndDate: workOrder.estimatedEndDate.toISOString(),
			solicitationDate: workOrder.solicitationDate.toISOString(),
			responsible: workOrder.responsible
				? { id: workOrder.responsible.id, name: workOrder.responsible.name ?? "" }
				: null,
			supervisor: workOrder.supervisor
				? { id: workOrder.supervisor.id, name: workOrder.supervisor.name ?? "" }
				: null,
			workRequested: workOrder.workRequested
				? { id: workOrder.workRequested.id, requestNumber: workOrder.workRequested.requestNumber }
				: null,
			maintenancePlanTask: workOrder.MaintenancePlanTask
				? { id: workOrder.MaintenancePlanTask.id, name: workOrder.MaintenancePlanTask.name }
				: null,
			_count: {
				milestones: workOrder._count.milestones,
				workEntries: workOrder._count.workBookEntries,
				inspections: inspectionCount,
			},
			top5: {
				milestones: workOrder.milestones.map((m) => ({
					id: m.id,
					name: m.name,
					status: m.status,
					startDate: m.startDate.toISOString(),
					endDate: m.endDate.toISOString(),
				})),
				workEntries: workOrder.workBookEntries.map((e) => ({
					id: e.id,
					activityName: e.activityName ?? null,
					executionDate: e.executionDate.toISOString(),
					entryType: e.entryType,
				})),
				inspections: inspections.map((i) => ({
					id: i.id,
					activityName: i.activityName ?? null,
					executionDate: i.executionDate.toISOString(),
				})),
			},
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error("[WORK_ORDER_SUMMARY_GET]", error)
		return NextResponse.json(
			{ error: "Error al obtener resumen de la orden de trabajo" },
			{ status: 500 }
		)
	}
}
