"use server"

import { z } from "zod"

import { DocumentCategory, EnvironmentalDocType, SafetyAndHealthDocumentType } from "@prisma/client"
import { MODULES, ACTIVITY_TYPE, EnvironmentDocType, TechSpecsDocumentType } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

const createDocumentSchema = z.object({
	userId: z.string(),
	startupFolderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	url: z.string(),
	category: z.nativeEnum(DocumentCategory),
	workerId: z.string().optional(),
	vehicleId: z.string().optional(),
	expirationDate: z.date(),
})

export type CreateStartupFolderDocumentInput = z.infer<typeof createDocumentSchema>

export async function createStartupFolderDocument(input: CreateStartupFolderDocumentInput) {
	const {
		url,
		userId,
		category,
		workerId,
		vehicleId,
		documentName,
		documentType,
		expirationDate,
		startupFolderId,
	} = createDocumentSchema.parse(input)

	const startupFolder = await prisma.startupFolder.findUnique({
		where: { id: startupFolderId },
		select: {
			id: true,
			companyId: true,
			basicFolders: {
				select: {
					id: true,
				},
			},
			workersFolders: workerId
				? {
						where: { workerId },
						select: { id: true },
					}
				: undefined,
			vehiclesFolders: vehicleId
				? {
						where: { vehicleId },
						select: { id: true },
					}
				: undefined,
			environmentalFolders: {
				select: { id: true },
			},
			environmentFolders: {
				select: { id: true },
			},
			techSpecsFolders: {
				select: { id: true },
			},
			safetyAndHealthFolders: {
				select: { id: true },
			},
		},
	})

	if (!startupFolder) {
		throw new Error("Startup folder not found")
	}

	// Verify user belongs to the company
	const user = await prisma.user.findUnique({ where: { id: userId } })
	if (!user || user.companyId !== startupFolder.companyId) {
		throw new Error("Unauthorized - User does not belong to this company")
	}

	logActivity({
		userId,
		module: MODULES.STARTUP_FOLDERS,
		action: ACTIVITY_TYPE.UPLOAD,
		entityId: startupFolderId,
		entityType: "StartupFolderDocument",
		metadata: {
			documentName,
			documentType,
			category,
			workerId,
			vehicleId,
			documentUrl: url,
			expirationDate: expirationDate.toISOString(),
		},
	})

	switch (category) {
		case "ENVIRONMENTAL": {
			const folder = startupFolder.environmentalFolders[0]
			if (!folder) {
				throw new Error("Environmental folder not found")
			}

			return await prisma.environmentalDocument.create({
				data: {
					url,
					category,
					expirationDate,
					name: documentName,
					folderId: folder.id,
					uploadedById: userId,
					type: documentType as EnvironmentalDocType,
				},
			})
		}

		case "ENVIRONMENT": {
			const folder = startupFolder.environmentFolders[0]
			if (!folder) {
				throw new Error("Environmental folder not found")
			}

			return await prisma.environmentDocument.create({
				data: {
					url,
					category,
					expirationDate,
					name: documentName,
					folderId: folder.id,
					uploadedById: userId,
					type: documentType as EnvironmentDocType,
				},
			})
		}

		case "TECHNICAL_SPECS": {
			const folder = startupFolder.techSpecsFolders[0]
			if (!folder) {
				throw new Error("Technical specs folder not found")
			}

			return await prisma.techSpecsDocument.create({
				data: {
					url,
					category,
					expirationDate,
					name: documentName,
					folderId: folder.id,
					uploadedById: userId,
					type: documentType as TechSpecsDocumentType,
				},
			})
		}

		case "SAFETY_AND_HEALTH": {
			const folder = startupFolder.safetyAndHealthFolders[0]
			if (!folder) {
				throw new Error("Safety and health folder not found")
			}

			return await prisma.safetyAndHealthDocument.create({
				data: {
					url,
					category,
					expirationDate,
					name: documentName,
					folderId: folder.id,
					uploadedById: userId,
					type: documentType as SafetyAndHealthDocumentType,
				},
			})
		}

		default:
			throw new Error(`Unsupported document category: ${category}`)
	}
}
