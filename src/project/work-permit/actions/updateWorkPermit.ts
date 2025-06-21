"use server"

import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "../schemas/work-permit.schema"

interface UpdateWorkPermitProps {
	id: string
	values: Omit<WorkPermitSchema, "otNumber" | "userId" | "companyId">
}

export const updateWorkPermit = async ({ id, values }: UpdateWorkPermitProps) => {
	try {
		const { participants, ...rest } = values

		const updatedWorkPermit = await prisma.workPermit.update({
			where: {
				id,
			},
			data: {
				...rest,
				participants: {
					connect: participants.map((participant) => ({
						id: participant.userId,
					})),
				},
			},
		})

		if (!updatedWorkPermit) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

		return {
			ok: true,
			message: "Permiso de trabajo actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el permiso de trabajo",
		}
	}
}
