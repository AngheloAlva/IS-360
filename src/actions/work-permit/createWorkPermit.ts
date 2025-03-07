"use server"

import prisma from "@/lib/prisma"

import type { workPermitSchema } from "@/lib/form-schemas/work-permit/work-permit-schema"
import type { z } from "zod"

export const createWorkPermit = async (values: z.infer<typeof workPermitSchema>) => {
	try {
		const { userId, ...rest } = values

		await prisma.workPermit.create({
			data: {
				...rest,
				workersNumber: +rest.workersNumber,
				activityDetails: rest.activityDetails.map((activity) => activity.activity),
				participants: {
					create: rest.participants.map((participant) => ({
						...participant,
						number: +participant.number,
					})),
				},
				otNumber: {
					create: {
						otNumber: rest.otNumber,
						contractCompany: "",
						endDate: new Date(),
						initDate: new Date(),
						quantityDays: 0,
						equipmentProperty: "",
						type: "",
						estimatedDuration: 0,
						printed: false,
						responsible: {
							connect: {
								id: userId,
							},
						},
					},
				},
				user: {
					connect: {
						id: userId,
					},
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
