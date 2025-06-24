"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_REQUEST_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ApproveWorkRequestProps {
	userId: string
	workRequestId: string
	action: "approve" | "reject"
}

export const approveOrRejectWorkRequest = async ({
	workRequestId,
	userId,
	action,
}: ApproveWorkRequestProps) => {
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
		const workRequest = await prisma.workRequest.update({
			where: {
				id: workRequestId,
			},
			data: {
				status: action === "approve" ? WORK_REQUEST_STATUS.APPROVED : WORK_REQUEST_STATUS.CANCELLED,
				approvalDate: new Date(),
				approvalBy: {
					connect: {
						id: userId,
					},
				},
			},
			select: {
				id: true,
				status: true,
				approvalDate: true,
				approvalById: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_REQUESTS,
			action: action === "approve" ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
			entityId: workRequest.id,
			entityType: "WorkRequest",
			metadata: {
				status: workRequest.status,
				approvalDate: workRequest.approvalDate,
				approvalById: workRequest.approvalById,
			},
		})

		return {
			ok: true,
			message:
				action === "approve"
					? "Solicitud de trabajo aprobada exitosamente"
					: "Solicitud de trabajo rechazada exitosamente",
		}
	} catch (error) {
		console.error("[APPROVE_OR_REJECT_WORK_PERMIT]", error)
		return {
			ok: false,
			message:
				action === "approve"
					? "Error al aprobar la solicitud de trabajo"
					: "Error al rechazar la solicitud de trabajo",
		}
	}
}
