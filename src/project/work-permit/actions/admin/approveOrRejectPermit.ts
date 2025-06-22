"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_PERMIT_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ApproveWorkPermitProps {
	userId: string
	workPermitId: string
	action: "approve" | "reject"
}

export const approveOrRejectWorkPermit = async ({
	workPermitId,
	userId,
	action,
}: ApproveWorkPermitProps) => {
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
		const workPermit = await prisma.workPermit.update({
			where: {
				id: workPermitId,
			},
			data: {
				status: action === "approve" ? WORK_PERMIT_STATUS.ACTIVE : WORK_PERMIT_STATUS.REJECTED,
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
				otNumber: {
					select: {
						otNumber: true,
						workName: true,
					},
				},
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_PERMITS,
			action: action === "approve" ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
			entityId: workPermit.id,
			entityType: "WorkPermit",
			metadata: {
				status: workPermit.status,
				approvalDate: workPermit.approvalDate,
				approvalById: workPermit.approvalById,
				otNumber: workPermit.otNumber?.otNumber,
				workName: workPermit.otNumber?.workName,
			},
		})

		return {
			ok: true,
			message:
				action === "approve"
					? "Permiso de trabajo aprobado exitosamente"
					: "Permiso de trabajo rechazado exitosamente",
		}
	} catch (error) {
		console.error("[APPROVE_OR_REJECT_WORK_PERMIT]", error)
		return {
			ok: false,
			message:
				action === "approve"
					? "Error al aprobar el permiso de trabajo"
					: "Error al rechazar el permiso de trabajo",
		}
	}
}
