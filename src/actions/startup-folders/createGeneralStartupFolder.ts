"use server"

import prisma from "@/lib/prisma"
import { GENERAL_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { CompanyDocumentType } from "@prisma/client"

interface CreateGeneralStartupFolderProps {
	companyId: string
}

/**
 * Crea la carpeta de arranque general para una empresa contratista
 * Esta función se llama cuando se crea una nueva empresa
 */
export const createGeneralStartupFolder = async ({
	companyId,
}: CreateGeneralStartupFolderProps) => {
	try {
		// Primero crea la carpeta general
		const generalFolder = await prisma.generalStartupFolder.create({
			data: {
				companyId,
				status: "DRAFT",
			},
		})

		// Luego crea los documentos base para la carpeta
		// Agrupa documentos por sección para asignar la subcategoría correcta
		const documentsToCreate = Object.entries(GENERAL_STARTUP_FOLDER_STRUCTURE)
			.flatMap(([, section]) => section.documents.map(doc => ({
				folderId: generalFolder.id,
				type: doc.type as CompanyDocumentType,
				fileType: doc.fileType,
				name: doc.name,
				url: "", // Url vacía inicialmente, se llenará cuando suban el documento
				subcategory: section.subcategory // Agrega la subcategoría según la sección
			})))

		if (documentsToCreate.length > 0) {
			await prisma.companyDocument.createMany({
				data: documentsToCreate,
			})
		}

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
