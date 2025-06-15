"use server"

import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"

export const createWorkPermit = async (values: WorkPermitSchema) => {
	try {
		const { userId, otNumber, companyId, participants, ...rest } = values

		await prisma.workPermit.create({
			data: {
				...rest,
				otNumber: {
					connect: {
						otNumber,
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
