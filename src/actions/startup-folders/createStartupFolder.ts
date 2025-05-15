"use server"

import prisma from "@/lib/prisma"
import {
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { CompanyDocumentType, EnvironmentalDocType } from "@prisma/client"

interface CreateGeneralStartupFolderProps {
	companyId: string
}

export const createGeneralStartupFolder = async ({
	companyId,
}: CreateGeneralStartupFolderProps) => {
	try {
		// Primero crea la carpeta general
		const generalFolder = await prisma.startupFolder.create({
			data: {
				companyId,
				status: "DRAFT",
			},
		})

		const environmentalDocumentsToCreate = ENVIRONMENTAL_STRUCTURE.documents.map((doc) => ({
			url: "",
			type: doc.type,
			name: doc.name,
			fileType: "FILE",
			folderId: generalFolder.id,
			category: ENVIRONMENTAL_STRUCTURE.category,
		}))

		const safetyAndHealthDocumentsToCreate = SAFETY_AND_HEALTH_STRUCTURE.documents.map((doc) => ({
			url: "",
			type: doc.type,
			name: doc.name,
			fileType: "FILE",
			folderId: generalFolder.id,
			category: SAFETY_AND_HEALTH_STRUCTURE.category,
		}))

		await prisma.companyDocument.createMany({
			data: safetyAndHealthDocumentsToCreate.map((doc) => ({
				...doc,
				type: doc.type as CompanyDocumentType,
			})),
		})

		await prisma.environmentalDocument.createMany({
			data: environmentalDocumentsToCreate.map((doc) => ({
				...doc,
				type: doc.type as EnvironmentalDocType,
			})),
		})

		return {
			ok: true,
			message: "Carpeta de arranque general creada correctamente",
			data: {
				folderId: generalFolder.id,
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
