"use server"

import { headers } from "next/headers"

import { sendMilestoneApprovalEmail } from "./milestone/sendMilestoneApprovalEmail"
import { ACTIVITY_TYPE, MILESTONE_STATUS, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ApproveMilestonesProps {
	approved: boolean
	workBookId: string
	rejectionReason?: string
}

export async function approveMilestones({
	workBookId,
	approved,
	rejectionReason,
}: ApproveMilestonesProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const workOrder = await prisma.workOrder.findUnique({
			where: { id: workBookId },
			select: {
				id: true,
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
				responsible: {
					select: {
						id: true,
						name: true,
					},
				},
				otNumber: true,
				workName: true,
			},
		})

		if (!workOrder) {
			return { ok: false, message: "Libro de obras no encontrado" }
		}

		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: workOrder.id },
			data: {
				isMilestonesApproved: approved,
			},
		})

		await prisma.milestone.updateMany({
			where: {
				workOrderId: updatedWorkOrder.id,
			},
			data: {
				status: approved ? MILESTONE_STATUS.PENDING : MILESTONE_STATUS.REJECTED_APPROVAL,
			},
		})

		logActivity({
			userId: session.user.id,
			entityType: "WorkOrder",
			module: MODULES.WORK_ORDERS,
			entityId: updatedWorkOrder.id,
			action: approved ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
			metadata: {
				status: updatedWorkOrder.status,
				otNumber: updatedWorkOrder.otNumber,
				workName: updatedWorkOrder.workName,
				companyId: workOrder.company?.id,
				companyName: workOrder.company?.name,
				rejectionReason: rejectionReason,
			},
		})

		if (workOrder.supervisor.email) {
			await sendMilestoneApprovalEmail({
				email: workOrder.supervisor.email,
				workOrderId: workOrder.id,
				responsibleName: workOrder.responsible?.name || session.user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || `Libro de Obras ${workOrder.otNumber}`,
				companyName: workOrder.company
					? workOrder.company.name + " - " + workOrder.company.rut
					: "Interno",
				approved,
				rejectionReason,
				approvalDate: new Date(),
			})
		}

		return {
			ok: true,
			message: `Hitos ${approved ? "Aprobados" : "Rechazados"} correctamente`,
		}
	} catch (error) {
		console.error("[WORK_BOOK_CLOSE]", error)
		return { ok: false, message: `Error al ${approved ? "Aprobar" : "Rechazar"} los hitos` }
	}
}
