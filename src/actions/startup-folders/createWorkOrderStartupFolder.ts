"use server"

import prisma from "@/lib/prisma"
import { WORK_ORDER_STARTUP_FOLDER_STRUCTURE } from "@/lib/consts/startup-folders"
import { WorkerDocumentType, VehicleDocumentType, EnvironmentalDocType } from "@prisma/client"

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

		// Crear documentos para Personal Asignado
		const workerDocuments = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.assignedPersonnel.documents.map(
			(doc) => ({
				type: doc.type as WorkerDocumentType,
				folderId: workOrderFolder.id,
				fileType: doc.fileType,
				name: doc.name,
				url: "", // Url vacía inicialmente, se llenará cuando suban el documento
			})
		)

		if (workerDocuments.length > 0) {
			await prisma.workerDocument.createMany({
				data: workerDocuments,
			})
		}

		// Crear documentos para Vehículos y Equipos
		const vehicleDocuments = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.vehiclesAndEquipment.documents.map(
			(doc) => ({
				folderId: workOrderFolder.id,
				type: doc.type as VehicleDocumentType,
				fileType: doc.fileType,
				name: doc.name,
				url: "", // Url vacía inicialmente
			})
		)

		if (vehicleDocuments.length > 0) {
			await prisma.vehicleDocument.createMany({
				data: vehicleDocuments,
			})
		}

		// Crear documentos para Procedimientos Específicos - Nota: estos ya tienen description en vez de type
		const procedureDocuments = [
			...WORK_ORDER_STARTUP_FOLDER_STRUCTURE.specificProcedures.documents,
			...WORK_ORDER_STARTUP_FOLDER_STRUCTURE.occupationalHealthAndSafety.documents,
		].map((doc) => ({
			description:
				doc.description || `Documento ${doc.required ? "requerido" : "opcional"} para el trabajo`,
			folderId: workOrderFolder.id,
			name: doc.name,
			fileType: doc.fileType,
			url: "", // Url vacía inicialmente
		}))

		if (procedureDocuments.length > 0) {
			await prisma.procedureDocument.createMany({
				data: procedureDocuments,
			})
		}

		// Crear documentos para Medio Ambiente
		const environmentalDocuments = WORK_ORDER_STARTUP_FOLDER_STRUCTURE.environment.documents.map(
			(doc) => ({
				type: doc.type as EnvironmentalDocType,
				folderId: workOrderFolder.id,
				fileType: doc.fileType,
				name: doc.name,
				url: "", // Url vacía inicialmente
			})
		)

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
