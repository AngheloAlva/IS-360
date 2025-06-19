"use server"

import { z } from "zod"

import prisma from "@/lib/prisma"
import {
	DocumentCategory,
	BasicDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

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
			basicFolder: {
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

	// Create document based on category
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

		case "BASIC": {
			const folder = startupFolder.basicFolder

			if (!folder) {
				throw new Error("Safety and health folder not found")
			}

			return await prisma.basicDocument.create({
				data: {
					url,
					category,
					expirationDate,
					name: documentName,
					folderId: folder.id,
					uploadedById: userId,
					type: documentType as BasicDocumentType,
				},
			})
		}

		default:
			throw new Error(`Unsupported document category: ${category}`)
	}
}
