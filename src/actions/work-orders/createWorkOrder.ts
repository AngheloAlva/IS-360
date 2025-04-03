"use server"

import { generateOTNumber } from "@/actions/work-orders/generateOTNumber"
import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/lib/form-schemas/admin/work-order/workOrder.schema"

interface CreateWorkOrderProps {
	values: WorkOrderSchema
}

export const createWorkOrder = async ({ values }: CreateWorkOrderProps) => {
	try {
		const { supervisorId, responsibleId, companyId, breakDays, equipment, ...rest } = values
		const otNumber = await generateOTNumber()

		await prisma.workOrder.create({
			data: {
				otNumber,
				responsible: {
					connect: {
						id: responsibleId,
					},
				},
				supervisor: {
					connect: {
						id: supervisorId,
					},
				},
				company: {
					connect: {
						id: companyId,
					},
				},
				...rest,
				isWorkBook: true,
				estimatedDays: +rest.estimatedDays,
				estimatedHours: +rest.estimatedHours,
				estimatedEndDate: rest.estimatedEndDate ? new Date(rest.estimatedEndDate) : undefined,
				requiresBreak: rest.requiresBreak || false,
				breakDays: breakDays ? +breakDays : 0,
				equipment: {
					connect: equipment.map((id) => ({ id })),
				},
			},
		})

		return {
			ok: true,
			message: "Orden de trabajo creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el orden de trabajo",
		}
	}
}
