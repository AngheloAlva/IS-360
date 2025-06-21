"use server"

import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"

interface CreateWorkPermitProps {
	userId: string
	companyId: string
	values: WorkPermitSchema
}

export const createWorkPermit = async ({ values, userId, companyId }: CreateWorkPermitProps) => {
	try {
		const { participants, ...rest } = values

		await prisma.workPermit.create({
			data: {
				...rest,
				otNumber: {
					connect: {
						otNumber: values.otNumber,
					},
				},
				user: {
					connect: {
						id: userId,
					},
				},
				company: {
					connect: {
						id: companyId,
					},
				},
				participants: {
					connect: participants.map((participant) => ({
						id: participant.userId,
					})),
				},
			},
		})

		return {
			ok: true,
			message: "Permiso de trabajo creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el permiso de trabajo",
		}
	}
}
