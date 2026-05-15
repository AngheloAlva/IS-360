"use server"

import { headers } from "next/headers"

import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	MODULES,
	ACTIVITY_TYPE,
	LABOR_CONTROL_STATUS,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import {
	markDocumentAsNotAppliedSchema,
	type MarkDocumentAsNotAppliedInput,
} from "../../schemas/mark-document-not-applied.schema"

export async function markWorkerLaborControlDocumentAsNotApplied(
	input: MarkDocumentAsNotAppliedInput
): Promise<{ ok: boolean; message?: string }> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return {
				ok: false,
				message: "No se encontró usuario",
			}
		}

		const { userId, folderId, documentType, documentName, workerId } =
			markDocumentAsNotAppliedSchema.parse(input)

		if (!workerId) {
			return {
				ok: false,
				message: "ID de trabajador requerido",
			}
		}

		const workerFolder = await prisma.workerLaborControlFolder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				worker: {
					select: {
						id: true,
						companyId: true,
					},
				},
			},
		})

		if (!workerFolder) {
			return {
				ok: false,
				message: "Carpeta de trabajador no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (
			!user ||
			(user.companyId !== workerFolder.worker?.companyId && user.accessRole !== "ADMIN")
		) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a esta empresa",
			}
		}

		const existingDocument = await prisma.workerLaborControlDocument.findFirst({
			where: {
				folderId,
				type: documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
			},
		})

		if (existingDocument) {
			return {
				ok: false,
				message:
					"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
			}
		}

		const document = await prisma.workerLaborControlDocument.create({
			data: {
				url: "",
				name: documentName,
				uploadById: userId,
				folderId: workerFolder.id,
				status: LABOR_CONTROL_STATUS.NOT_APPLIED,
				type: documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
			},
		})

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

  await logActivity({
			userId,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: document.id,
			entityType: "WorkerLaborControlDocument",
			metadata: {
				folderId,
				workerId,
				documentType,
				documentName,
				status: "NOT_APPLIED",
				action: "marked_as_not_applied",
			},
		})

		return {
			ok: true,
			message: "Documento marcado como 'No Aplica' exitosamente",
		}
	} catch (error) {
		console.error("Error al marcar documento como No Aplica:", error)
		return {
			ok: false,
			message: "Error al procesar la solicitud",
		}
	}
}
