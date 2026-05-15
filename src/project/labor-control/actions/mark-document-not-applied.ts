"use server"

import { headers } from "next/headers"

import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	MODULES,
	ACTIVITY_TYPE,
	LABOR_CONTROL_STATUS,
	LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import {
	markDocumentAsNotAppliedSchema,
	type MarkDocumentAsNotAppliedInput,
} from "../schemas/mark-document-not-applied.schema"

export async function markLaborControlDocumentAsNotApplied(
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

		const { userId, folderId, documentType, documentName } =
			markDocumentAsNotAppliedSchema.parse(input)

		const folder = await prisma.laborControlFolder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!folder) {
			return {
				ok: false,
				message: "Carpeta no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || (user.companyId !== folder.companyId && user.accessRole !== "ADMIN")) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a esta empresa",
			}
		}

		const existingDocument = await prisma.laborControlDocument.findFirst({
			where: {
				folderId,
				type: documentType as LABOR_CONTROL_DOCUMENT_TYPE,
			},
		})

		if (existingDocument) {
			return {
				ok: false,
				message:
					"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
			}
		}

		const document = await prisma.laborControlDocument.create({
			data: {
				url: "",
				folderId,
				name: documentName,
				uploadById: userId,
				type: documentType as LABOR_CONTROL_DOCUMENT_TYPE,
				status: LABOR_CONTROL_STATUS.NOT_APPLIED,
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
			entityId: document.id,
			action: ACTIVITY_TYPE.UPDATE,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			entityType: "LaborControlDocument",
			metadata: {
				folderId,
				documentName,
				documentType,
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
