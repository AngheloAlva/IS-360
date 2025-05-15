"use server"

import { generateOTNumber } from "@/actions/work-orders/generateOTNumber"
import { sendNewWorkOrderEmail } from "./sendNewWorkOrderEmail"
import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/lib/form-schemas/admin/work-order/workOrder.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkOrderProps {
	values: WorkOrderSchema
	initReportFile?: FileUploadResult
}

export const createWorkOrder = async ({ values, initReportFile }: CreateWorkOrderProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { supervisorId, responsibleId, companyId, file, breakDays, equipment, ...rest } = values
		const otNumber = await generateOTNumber()

		const newWorkOrder = await prisma.workOrder.create({
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
				...(initReportFile
					? {
							initReport: {
								create: {
									url: initReportFile.url,
									name: initReportFile.name,
									type: initReportFile.type,
								},
							},
						}
					: {}),
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
