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
				equipment: {
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
			let nextDate: Date

			switch (maintenancePlanTaskData.frequency) {
				case PLAN_FREQUENCY.DAILY:
					nextDate = addDays(maintenancePlanTaskData.nextDate, 1)
					break
				case PLAN_FREQUENCY.WEEKLY:
					nextDate = addWeeks(maintenancePlanTaskData.nextDate, 1)
					break
				case PLAN_FREQUENCY.MONTHLY:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 1)
					break
				case PLAN_FREQUENCY.BIMONTHLY:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 2)
					break
				case PLAN_FREQUENCY.QUARTERLY:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 3)
					break
				case PLAN_FREQUENCY.FOURMONTHLY:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 4)
					break
				case PLAN_FREQUENCY.BIANNUAL:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 6)
					break
				case PLAN_FREQUENCY.YEARLY:
					nextDate = addMonths(maintenancePlanTaskData.nextDate, 12)
					break
				default:
					nextDate = maintenancePlanTaskData.nextDate
			}

			await prisma.maintenancePlanTask.update({
				where: {
					id: maintenancePlanTaskData.id,
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
				equipment: newWorkOrder.equipment,
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
				equipment: newWorkOrder.equipment,
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
