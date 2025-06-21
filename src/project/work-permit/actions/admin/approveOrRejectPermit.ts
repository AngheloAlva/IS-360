"use server"

import { WORK_PERMIT_STATUS } from "@prisma/client"
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
	try {
		await prisma.workPermit.update({
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
		})

		return {
			ok: true,
			message:
				action === "approve"
					? "Permiso de trabajo aprobado exitosamente"
					: "Permiso de trabajo rechazado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message:
				action === "approve"
					? "Error al aprobar el permiso de trabajo"
					: "Error al rechazar el permiso de trabajo",
		}
	}
}
