"use server"

import { generateOTNumber } from "@/actions/work-orders/generateOTNumber"
import prisma from "@/lib/prisma"

import type { WorkOrderSchemaByTask } from "@/lib/form-schemas/maintenance-plan/work-order-by-task.schema"
import { sendNewWorkOrderEmail } from "../work-orders/sendNewWorkOrderEmail"
import { addMonths } from "date-fns"

interface CreateWorkOrderProps {
	equipmentId?: string
	values: WorkOrderSchemaByTask
	maintenancePlanTaskId?: string
}

export const createWorkOrderByTask = async ({
	values,
	equipmentId,
	maintenancePlanTaskId,
}: CreateWorkOrderProps) => {
	try {
		const maintenancePlanTask = await prisma.maintenancePlanTask.findUnique({
			where: {
				id: maintenancePlanTaskId,
			},
			select: {
				id: true,
				nextDate: true,
				frequency: true,
			},
		})

		if (!maintenancePlanTask) {
			return {
				ok: false,
				message: "Tarea de mantenimiento no encontrada",
			}
		}

		const {
			supervisorId,
			responsibleId,
			companyId,
			breakDays,
			solicitationDate,
			solicitationTime,
			...rest
		} = values
		const otNumber = await generateOTNumber()

		const newWorkOrder = await prisma.workOrder.create({
			data: {
				otNumber,
				solicitationDate: solicitationDate ?? new Date(),
				solicitationTime: solicitationTime ?? new Date().toTimeString().split(" ")[0],
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
				MaintenancePlanTask: {
					connect: {
						id: maintenancePlanTask.id,
					},
				},
				equipment: {
					connect: {
						id: equipmentId,
					},
				},
			},
		})

		await prisma.maintenancePlanTask.update({
			where: {
				id: maintenancePlanTask.id,
			},
			data: {
				nextDate: addMonths(maintenancePlanTask.nextDate, 1),
			},
		})

		const workOrder = await prisma.workOrder.findUnique({
			where: {
				id: newWorkOrder.id,
			},
			include: {
				responsible: {
					select: {
						name: true,
					},
				},
				supervisor: {
					select: {
						name: true,
						email: true,
					},
				},
				equipment: {
					select: {
						name: true,
					},
				},
			},
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "Error al crear el orden de trabajo",
			}
		}

		sendNewWorkOrderEmail({
			workOrder: {
				otNumber: workOrder.otNumber,
				type: workOrder.type,
				priority: workOrder.priority,
				equipment: workOrder.equipment,
				programDate: workOrder.programDate,
				estimatedDays: +workOrder.estimatedDays,
				estimatedHours: +workOrder.estimatedHours,
				responsible: {
					name: workOrder.responsible.name,
				},
				workDescription: workOrder.workDescription,
				supervisor: {
					name: workOrder.supervisor.name,
					email: workOrder.supervisor.email,
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
