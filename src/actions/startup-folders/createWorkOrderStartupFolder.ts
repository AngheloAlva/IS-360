"use server"

import { WORK_ORDER_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import prisma from "@/lib/prisma"

import type { VehicleDocumentType, EnvironmentalDocType } from "@prisma/client"

interface CreateWorkOrderStartupFolderProps {
	workOrderId: string
}

/**
 * Crea la carpeta de arranque específica para una orden de trabajo
 * Esta función se llama cuando se crea una nueva orden de trabajo
 */
export const createWorkOrderStartupFolder = async ({
	workOrderId,
}: CreateWorkOrderStartupFolderProps) => {
	try {
		// Primero crea la carpeta de orden de trabajo
		const workOrderFolder = await prisma.workOrderStartupFolder.create({
			data: {
				workOrderId,
				status: "DRAFT",
			},
		})

		// NO creamos documentos para trabajadores automáticamente
		// Estos se crearán cuando se agreguen trabajadores específicos a la orden de trabajo

		// Crear documentos para Vehículos y Equipos
		const vehicleSection = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.vehiclesAndEquipment
		const vehicleDocuments = vehicleSection.documents.map((doc) => ({
			folderId: workOrderFolder.id,
			type: doc.type as VehicleDocumentType,
			fileType: doc.fileType,
			name: doc.name,
			url: "", // Url vacía inicialmente
			subcategory: vehicleSection.subcategory,
		}))

		if (vehicleDocuments.length > 0) {
			await prisma.vehicleDocument.createMany({
				data: vehicleDocuments,
			})
		}

		// Crear documentos para Procedimientos Específicos
		const procedureSection = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.specificProcedures
		const procedureDocuments = procedureSection.documents.map((doc) => ({
			description:
				doc.description || `Documento ${doc.required ? "requerido" : "opcional"} para el trabajo`,
			folderId: workOrderFolder.id,
			name: doc.name,
			fileType: doc.fileType,
			url: "", // Url vacía inicialmente
			subcategory: procedureSection.subcategory,
		}))

		if (procedureDocuments.length > 0) {
			await prisma.procedureDocument.createMany({
				data: procedureDocuments,
			})
		}

		// Crear documentos para Medio Ambiente
		const environmentSection = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.environment
		const environmentalDocuments = environmentSection.documents.map((doc) => ({
			type: doc.type as EnvironmentalDocType,
			folderId: workOrderFolder.id,
			fileType: doc.fileType,
			name: doc.name,
			url: "", // Url vacía inicialmente
			subcategory: environmentSection.subcategory,
		}))

		if (environmentalDocuments.length > 0) {
			await prisma.environmentalDocument.createMany({
				data: environmentalDocuments,
			})
		}

		return {
			ok: true,
			message: "Carpeta de arranque para orden de trabajo creada correctamente",
			data: {
				folderId: workOrderFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al crear la carpeta de arranque para orden de trabajo:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque para orden de trabajo",
		}
	}
}
