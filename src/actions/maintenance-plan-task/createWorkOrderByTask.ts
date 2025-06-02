"use server"

import { addDays, addMonths, addWeeks } from "date-fns"

import { sendNewWorkOrderEmail } from "../work-orders/sendNewWorkOrderEmail"
import { generateOTNumber } from "@/actions/work-orders/generateOTNumber"
import { PLAN_FREQUENCY } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { WorkOrderSchemaByTask } from "@/lib/form-schemas/maintenance-plan/work-order-by-task.schema"

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
				attachments: true,
			},
		})

		if (!maintenancePlanTask) {
			return {
				ok: false,
				message: "Tarea de mantenimiento no encontrada",
			}
		}

		const {
			breakDays,
			companyId,
			supervisorId,
			responsibleId,
			solicitationDate,
			solicitationTime,
			isInternalResponsible,
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
						...(isInternalResponsible
							? { email: "scontrol.trm@oleotrasandino.cl" }
							: { id: supervisorId }),
					},
				},
				...(companyId
					? {
							company: {
								connect: {
									id: companyId,
								},
							},
						}
					: {}),
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
				manualDocuments: {
					connect: maintenancePlanTask.attachments.map((attachment) => ({
						id: attachment.id,
					})),
				},
			},
		})

		let nextDate: Date

		switch (maintenancePlanTask.frequency) {
			case PLAN_FREQUENCY.DAILY:
				nextDate = addDays(maintenancePlanTask.nextDate, 1)
				break
			case PLAN_FREQUENCY.WEEKLY:
				nextDate = addWeeks(maintenancePlanTask.nextDate, 1)
				break
			case PLAN_FREQUENCY.MONTHLY:
				nextDate = addMonths(maintenancePlanTask.nextDate, 1)
				break
			case PLAN_FREQUENCY.BIMONTHLY:
				nextDate = addMonths(maintenancePlanTask.nextDate, 2)
				break
			case PLAN_FREQUENCY.QUARTERLY:
				nextDate = addMonths(maintenancePlanTask.nextDate, 3)
				break
			case PLAN_FREQUENCY.FOURMONTHLY:
				nextDate = addMonths(maintenancePlanTask.nextDate, 4)
				break
			case PLAN_FREQUENCY.BIANNUAL:
				nextDate = addMonths(maintenancePlanTask.nextDate, 6)
				break
			case PLAN_FREQUENCY.YEARLY:
				nextDate = addMonths(maintenancePlanTask.nextDate, 12)
				break
			default:
				nextDate = maintenancePlanTask.nextDate
		}

		await prisma.maintenancePlanTask.update({
			where: {
				id: maintenancePlanTask.id,
			},
			data: {
				nextDate: nextDate,
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
