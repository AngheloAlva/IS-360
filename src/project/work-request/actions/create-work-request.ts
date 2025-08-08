"use server"

import { headers } from "next/headers"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
import { sendNewWorkRequestEmail } from "./send-new-work-request"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { USER_ROLE } from "@/lib/permissions"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkRequestSchema } from "@/project/work-request/schemas/work-request.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkRequestProps {
	userId: string
	values: WorkRequestSchema
	attachments?: FileUploadResult[]
}

export const createWorkRequest = async ({
	values,
	userId,
	attachments,
}: CreateWorkRequestProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	try {
		const counter = await prisma.workRequestCounter.upsert({
			where: { id: "work-request-counter" },
			update: { value: { increment: 1 } },
			create: { id: "work-request-counter", value: 1 },
		})

		const year = new Date().getFullYear()
		const requestNumber = `REQ-${year}-${counter.value.toString().padStart(4, "0")}`

		const { workType, description, equipments, requestDate, isUrgent, observations, operatorId } =
			values

		const newWorkRequest = await prisma.workRequest.create({
			data: {
				userId,
				workType,
				description,
				requestDate,
				observations,
				requestNumber,
				isUrgent: isUrgent || false,
				equipments: {
					connect: {
						id: equipments,
					},
				},
				operatorId: operatorId || null,
				...(attachments && attachments.length > 0
					? {
							attachments: {
								create: attachments.map((attachment) => ({
									url: attachment.url,
									name: attachment.name,
									type: attachment.type || "image/jpeg",
								})),
							},
						}
					: {}),
			},
			include: {
				equipments: true,
			},
		})

		sendNewWorkRequestEmail({
			requestDate,
			description,
			observations,
			requestNumber,
			userName: session.user.name,
			isUrgent: isUrgent || false,
			equipmentName: newWorkRequest.equipments.map((equipment) => equipment.name),
			baseUrl: process.env.NEXT_PUBLIC_BASE_URL + "/admin/dashboard/solicitudes-de-trabajo",
		})

		sendNotification({
			creatorId: userId,
			type: "WORK_REQUEST_CREATED",
			targetRoles: [USER_ROLE.admin, USER_ROLE.workRequestOperator],
			title: `Nueva Solicitud de Trabajo ${isUrgent ? "URGENTE 🚨" : ""}`,
			link: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/solicitudes-de-trabajo`,
			message: `Se ha creado una nueva solicitud de trabajo ${isUrgent ? "URGENTE 🚨" : ""} #${requestNumber} - ${description}`,
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_REQUESTS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newWorkRequest.id,
			entityType: "WorkRequest",
			metadata: {
				requestNumber: newWorkRequest.requestNumber,
				description: newWorkRequest.description,
				isUrgent: newWorkRequest.isUrgent,
				requestDate: newWorkRequest.requestDate,
				observations: newWorkRequest.observations,
				location: newWorkRequest.location,
				customLocation: newWorkRequest.customLocation,
				workType: newWorkRequest.workType,
				userId,
			},
		})

		return {
			success: "Solicitud de trabajo creada exitosamente",
			id: newWorkRequest.id,
		}
	} catch (error) {
		console.error("Error al crear la solicitud de trabajo:", error)
		return {
			error: "Error al crear la solicitud de trabajo",
		}
	}
}
