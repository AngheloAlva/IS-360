"use server"

import prisma from "@/lib/prisma"

import { type WorkRequestSchema } from "@/features/work-request/schemas/work-request.schema"
import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateWorkRequestProps {
	userId: string
	values: WorkRequestSchema
	attachments?: FileUploadResult[]
}

export const createWorkRequest = async ({
	values,
	attachments,
	userId,
}: CreateWorkRequestProps) => {
	try {
		// Obtener el siguiente número de solicitud
		const counter = await prisma.workRequestCounter.upsert({
			where: { id: "work-request-counter" },
			update: { value: { increment: 1 } },
			create: { id: "work-request-counter", value: 1 },
		})

		// Generar el número de solicitud con formato REQ-YYYY-XXXX
		const year = new Date().getFullYear()
		const requestNumber = `REQ-${year}-${counter.value.toString().padStart(4, "0")}`

		// Crear la solicitud de trabajo
		const newWorkRequest = await prisma.workRequest.create({
			data: {
				requestNumber,
				description: values.description,
				isUrgent: values.isUrgent,
				requestDate: values.requestDate,
				observations: values.observations || null,
				location: values.location,
				customLocation: values.location === "OTHER" ? values.customLocation : null,
				userId,
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
		})

		// Enviar notificación por correo electrónico
		// Aquí podríamos enviar una notificación por correo electrónico a los administradores
		// sobre la nueva solicitud de trabajo creada

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
