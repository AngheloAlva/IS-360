"use server"

import prisma from "@/lib/prisma"
import {
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

import type { EnvironmentalDocType, SafetyAndHealthDocumentType } from "@prisma/client"

interface CreateStartupFolderProps {
	companyId: string
}

export const createStartupFolder = async ({ companyId }: CreateStartupFolderProps) => {
	try {
		// Primero crea la carpeta general
		const startupFolder = await prisma.startupFolder.create({
			data: {
				companyId,
			},
		})

		const environmentalDocumentsToCreate = ENVIRONMENTAL_STRUCTURE.documents.map((doc) => ({
			url: "",
			name: doc.name,
			folderId: startupFolder.id,
			type: doc.type as EnvironmentalDocType,
			category: ENVIRONMENTAL_STRUCTURE.category,
		}))

		const safetyAndHealthDocumentsToCreate = SAFETY_AND_HEALTH_STRUCTURE.documents.map((doc) => ({
			url: "",
			name: doc.name,
			folderId: startupFolder.id,
			type: doc.type as SafetyAndHealthDocumentType,
			category: SAFETY_AND_HEALTH_STRUCTURE.category,
		}))

		await prisma.safetyAndHealthFolder.create({
			data: {
				startupFolder: {
					connect: {
						id: startupFolder.id,
					},
				},
				documents: {
					createMany: {
						data: safetyAndHealthDocumentsToCreate,
					},
				},
			},
		})

		await prisma.environmentalFolder.create({
			data: {
				startupFolder: {
					connect: {
						id: startupFolder.id,
					},
				},
				documents: {
					createMany: {
						data: environmentalDocumentsToCreate,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Carpeta de arranque general creada correctamente",
			data: {
				folderId: startupFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al crear la carpeta de arranque general:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque general",
		}
	}
}
