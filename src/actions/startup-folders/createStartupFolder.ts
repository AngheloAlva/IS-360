"use server"

import { CompanyDocumentType, EnvironmentalDocType, VehicleDocumentType } from "@prisma/client"
import prisma from "@/lib/prisma"
import {
	VEHICLE_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

interface CreateStartupFolderProps {
	companyId: string
}

export const createStartupFolder = async ({ companyId }: CreateStartupFolderProps) => {
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

		const vehiclesDocumentsToCreate = VEHICLE_STRUCTURE.documents.find(
			(doc) => doc.type === VehicleDocumentType.EQUIPMENT_FILE
		)

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

		await prisma.vehicleDocument.create({
			data: {
				url: "",
				fileType: "FILE",
				folderId: generalFolder.id,
				category: VEHICLE_STRUCTURE.category,
				type: VehicleDocumentType.EQUIPMENT_FILE,
				name: vehiclesDocumentsToCreate?.name || "",
			},
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
