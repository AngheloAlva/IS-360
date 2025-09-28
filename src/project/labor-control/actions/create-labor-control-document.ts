"use server"

import { z } from "zod"

import { MODULES, ACTIVITY_TYPE, type LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	folderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
})

export type CreateLaborControlDocumentInput = z.infer<typeof createDocumentSchema>

export async function createLaborControlDocument(
	input: CreateLaborControlDocumentInput
): Promise<{ ok: boolean; message?: string }> {
	try {
		const { url, userId, folderId, documentName, documentType } = createDocumentSchema.parse(input)

		const folder = await prisma.laborControlFolder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!folder) {
			throw new Error("Folder not found")
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || user.companyId !== folder.companyId) {
			throw new Error("Unauthorized - User does not belong to this company")
		}

		const document = await prisma.laborControlDocument.create({
			data: {
				url,
				folderId,
				name: documentName,
				uploadById: userId,
				type: documentType as LABOR_CONTROL_DOCUMENT_TYPE,
			},
		})

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

		logActivity({
			userId,
			entityId: folderId,
			action: ACTIVITY_TYPE.UPLOAD,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			entityType: "LaborControlDocument",
			metadata: {
				folderId,
				documentName,
				documentType,
				documentUrl: url,
			},
		})

		return {
			ok: true,
			message: "Document created successfully",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el documento",
		}
	}
}
