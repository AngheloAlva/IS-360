"use server"

import { addDays, addMonths, addWeeks } from "date-fns"
import { headers } from "next/headers"

import { generateOTNumber } from "@/project/work-order/actions/generateOTNumber"
import { sendNewWorkOrderEmail } from "./sendNewWorkOrderEmail"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { PLAN_FREQUENCY } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/project/work-order/schemas/workOrder.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkOrderProps {
	equipmentId?: string[]
	workRequestId?: string
	values: WorkOrderSchema
	maintenancePlanTaskId?: string[]
	initReportFile?: FileUploadResult
}

export const createWorkOrder = async ({
	values,
	equipmentId,
	workRequestId,
	initReportFile,
	maintenancePlanTaskId,
}: CreateWorkOrderProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const maintenancePlanTaskData:
			| {
					id: string
					equipment: {
						id: string
					}
					nextDate: Date
					frequency: PLAN_FREQUENCY
					attachments: {
						id: string
					}[]
			  }[]
			| null = []

		if (maintenancePlanTaskId) {
			for (const taskId of maintenancePlanTaskId) {
				const taskData = await prisma.maintenancePlanTask.findUnique({
					where: {
						id: taskId,
					},
					select: {
						id: true,
						equipment: {
							select: {
								id: true,
								name: true,
							},
						},
						nextDate: true,
						frequency: true,
						attachments: {
							select: {
								id: true,
								name: true,
								type: true,
								url: true,
							},
						},
					},
				})

				if (!taskData) {
					return {
						ok: false,
						message: "Tarea de mantenimiento no encontrada",
					}
				}

				maintenancePlanTaskData.push(taskData)
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
					connect: { id: supervisorId },
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
				...(maintenancePlanTaskData.length > 0
					? {
							MaintenancePlanTask: {
								connect: {
									id: maintenancePlanTaskData[0].id,
								},
							},
							manualDocuments: {
								connect: maintenancePlanTaskData[0].attachments.map((attachment) => ({
									id: attachment.id,
								})),
							},
						}
					: {}),
				estimatedDays: +rest.estimatedDays,
				estimatedHours: +rest.estimatedHours,
				solicitationDate: rest.solicitationDate ? new Date(rest.solicitationDate) : new Date(),
				solicitationTime: rest.solicitationTime
					? rest.solicitationTime
					: new Date().toTimeString().split(" ")[0],
				estimatedEndDate: rest.estimatedEndDate ? new Date(rest.estimatedEndDate) : new Date(),
				equipments: {
					connect: equipmentId
						? equipmentId.map((id) => ({ id }))
						: equipment.map((id) => ({ id })),
				},
			},
			select: {
				id: true,
				status: true,
				otNumber: true,
				type: true,
				priority: true,
				programDate: true,
				estimatedDays: true,
				estimatedHours: true,
				workDescription: true,
				responsible: {
					select: {
						id: true,
						name: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				equipments: {
					select: {
						id: true,
						name: true,
					},
				},
				company: {
					select: {
						id: true,
						name: true,
					},
				},
				initReport: {
					select: {
						id: true,
						name: true,
						type: true,
						url: true,
					},
				},
				MaintenancePlanTask: {
					select: {
						id: true,
						nextDate: true,
						frequency: true,
						attachments: {
							select: {
								id: true,
								name: true,
								type: true,
								url: true,
							},
						},
					},
				},
			},
		})

		if (maintenancePlanTaskData) {
			for (const task of maintenancePlanTaskData) {
				let nextDate: Date

				switch (task.frequency) {
					case PLAN_FREQUENCY.DAILY:
						nextDate = addDays(task.nextDate, 1)
						break
					case PLAN_FREQUENCY.WEEKLY:
						nextDate = addWeeks(task.nextDate, 1)
						break
					case PLAN_FREQUENCY.MONTHLY:
						nextDate = addMonths(task.nextDate, 1)
						break
					case PLAN_FREQUENCY.BIMONTHLY:
						nextDate = addMonths(task.nextDate, 2)
						break
					case PLAN_FREQUENCY.QUARTERLY:
						nextDate = addMonths(task.nextDate, 3)
						break
					case PLAN_FREQUENCY.FOURMONTHLY:
						nextDate = addMonths(task.nextDate, 4)
						break
					case PLAN_FREQUENCY.BIANNUAL:
						nextDate = addMonths(task.nextDate, 6)
						break
					case PLAN_FREQUENCY.YEARLY:
						nextDate = addMonths(task.nextDate, 12)
						break
					default:
						nextDate = task.nextDate
				}

				await prisma.maintenancePlanTask.update({
					where: {
						id: task.id,
					},
					data: {
						nextDate,
						workOrders: {
							connect: {
								id: newWorkOrder.id,
							},
						},
					},
				})
			}
		}

		if (workRequestId) {
			await prisma.workRequest.update({
				where: {
					id: workRequestId,
				},
				data: {
					status: "ATTENDED",
					workOrders: {
						connect: {
							id: newWorkOrder.id,
						},
					},
				},
			})
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newWorkOrder.id,
			entityType: "WorkOrder",
			metadata: {
				status: newWorkOrder.status,
				otNumber: newWorkOrder.otNumber,
				type: newWorkOrder.type,
				priority: newWorkOrder.priority,
				programDate: newWorkOrder.programDate,
				estimatedDays: newWorkOrder.estimatedDays,
				estimatedHours: newWorkOrder.estimatedHours,
				workDescription: newWorkOrder.workDescription,
				responsible: newWorkOrder.responsible,
				supervisor: newWorkOrder.supervisor,
				equipments: newWorkOrder.equipments,
				company: newWorkOrder.company,
				initReport: newWorkOrder.initReport,
				maintenancePlanTask: newWorkOrder.MaintenancePlanTask,
			},
		})

		sendNewWorkOrderEmail({
			workOrder: {
				otNumber: newWorkOrder.otNumber,
				type: newWorkOrder.type,
				priority: newWorkOrder.priority,
				equipments: newWorkOrder.equipments,
				programDate: newWorkOrder.programDate,
				estimatedDays: +newWorkOrder.estimatedDays,
				estimatedHours: +newWorkOrder.estimatedHours,
				responsible: {
					name: newWorkOrder.responsible.name,
				},
				workDescription: newWorkOrder.workDescription,
				supervisor: {
					name: newWorkOrder.supervisor.name,
					email: newWorkOrder.supervisor.email,
				},
			},
		})

		return {
			ok: true,
			message: "Orden de trabajo creado exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_WORK_ORDER]", error)
		return {
			ok: false,
			message: "Error al crear el orden de trabajo",
		}
	}
}
