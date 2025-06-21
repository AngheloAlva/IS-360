"use server"

import { generateOTNumber } from "@/project/work-order/actions/generateOTNumber"
import { sendNewWorkOrderEmail } from "./sendNewWorkOrderEmail"
import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/project/work-order/schemas/workOrder.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"
import { PLAN_FREQUENCY } from "@prisma/client"

interface CreateWorkOrderProps {
	equipmentId?: string
	values: WorkOrderSchema
	maintenancePlanTaskId?: string
	initReportFile?: FileUploadResult
}

export const createWorkOrder = async ({
	values,
	equipmentId,
	initReportFile,
	maintenancePlanTaskId,
}: CreateWorkOrderProps) => {
	try {
		let maintenancePlanTaskData: {
			id: string
			equipment: {
				id: string
			}
			nextDate: Date
			frequency: PLAN_FREQUENCY
			attachments: {
				id: string
			}[]
		} | null = null

		if (maintenancePlanTaskId) {
			maintenancePlanTaskData = await prisma.maintenancePlanTask.findUnique({
				where: {
					id: maintenancePlanTaskId,
				},
				select: {
					id: true,
					equipment: true,
					nextDate: true,
					frequency: true,
					attachments: true,
				},
			})

			if (!maintenancePlanTaskData) {
				return {
					ok: false,
					message: "Tarea de mantenimiento no encontrada",
				}
			}
		}

		const otNumber = await generateOTNumber()
		const {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			file,
			equipment,
			companyId,
			supervisorId,
			responsibleId,
			isInternalResponsible,
			...rest
		} = values

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
				...(maintenancePlanTaskData
					? {
							MaintenancePlanTask: {
								connect: {
									id: maintenancePlanTaskData.id,
								},
							},
							manualDocuments: {
								connect: maintenancePlanTaskData.attachments.map((attachment) => ({
									id: attachment.id,
								})),
							},
						}
					: {}),
				isWorkBook: true,
				estimatedDays: +rest.estimatedDays,
				estimatedHours: +rest.estimatedHours,
				solicitationDate: rest.solicitationDate ? new Date(rest.solicitationDate) : new Date(),
				solicitationTime: rest.solicitationTime
					? rest.solicitationTime
					: new Date().toTimeString().split(" ")[0],
				estimatedEndDate: rest.estimatedEndDate ? new Date(rest.estimatedEndDate) : undefined,
				requiresBreak: false,
				breakDays: 0,
				equipment: {
					connect: equipmentId ? { id: equipmentId } : equipment.map((id) => ({ id })),
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
