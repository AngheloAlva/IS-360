"use server"

import { z } from "zod"

import { ACTIVITY_TYPE, BasicDocumentType, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createBasicDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	workerId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	expirationDate: z.date(),
	startupFolderId: z.string(),
})

export type CreateBasicDocumentInput = z.infer<typeof createBasicDocumentSchema>

export async function createBasicDocument(input: CreateBasicDocumentInput) {
	try {
		const { userId, workerId, documentType, documentName, url, expirationDate, startupFolderId } =
			createBasicDocumentSchema.parse(input)

		const basicFolder = await prisma.basicFolder.findUnique({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
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

		if (!basicFolder) {
			return {
				ok: false,
				message: "Carpeta de personal no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (!user || user.companyId !== basicFolder.worker?.companyId) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a la empresa",
			}
		}

		const document = await prisma.basicDocument.create({
			data: {
				url,
				expirationDate,
				name: documentName,
				uploadedById: userId,
				folderId: basicFolder.id,
				category: DocumentCategory.BASIC,
				type: documentType as BasicDocumentType,
			},
		})

		console.log(document)

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

		logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: document.id,
			entityType: "BasicDocument",
			metadata: {
				documentName,
				documentType,
				workerId,
				startupFolderId,
				documentUrl: url,
				expirationDate: expirationDate.toISOString(),
			},
		})

		return {
			ok: true,
			message: "Documento de personal subido correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Ocurrio un error subiendo el documento",
		}
	}
}
