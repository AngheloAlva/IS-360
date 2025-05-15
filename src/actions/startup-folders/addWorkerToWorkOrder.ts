"use server"

import prisma from "@/lib/prisma"
import { WORKER_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import { DocumentCategory, WorkerDocumentType } from "@prisma/client"

interface AddWorkerToWorkOrderProps {
	folderId: string
	name: string
	rut: string
}

export const addWorkerToWorkOrder = async ({ folderId, name, rut }: AddWorkerToWorkOrderProps) => {
	try {
		// Verificar si la carpeta existe
		const folderExists = await prisma.startupFolder.findUnique({
			where: {
				id: folderId,
			},
		})

		if (!folderExists) {
			return {
				ok: false,
				message: "No se encontró la carpeta de arranque para esta orden de trabajo",
			}
		}

		// Verificar que la carpeta esté en estado DRAFT o REJECTED para poder modificar documentos
		if (folderExists.status !== "DRAFT" && folderExists.status !== "REJECTED") {
			return {
				ok: false,
				message:
					"No puedes agregar trabajadores a esta carpeta porque está en revisión o ya fue aprobada",
			}
		}

		// Formato del nombre para los documentos: "[Tipo Documento] - [Nombre Trabajador] ([RUT])"
		// Ejemplo: "Contrato de Trabajo - Juan Pérez (12.345.678-9)"
		const workerIdentifier = `${name} (${rut})`

		// Obtener la configuración de documentos necesarios para un trabajador
		const workerSection = WORKER_STRUCTURE.documents

		// Crear documentos para el trabajador
		const workerDocuments = workerSection.map((doc) => ({
			type: doc.type as WorkerDocumentType,
			folderId,
			fileType: "FILE",
			category: DocumentCategory.PERSONNEL,
			// Usamos el nombre original del documento y añadimos el identificador del trabajador
			name: `${doc.name} - ${workerIdentifier}`,
			url: "", // Url vacía inicialmente, se llenará cuando suban el documento
		}))

		// Crear los documentos en la base de datos
		if (workerDocuments.length > 0) {
			await prisma.workerDocument.createMany({
				data: workerDocuments,
			})
		}

		return {
			ok: true,
			message: "Trabajador y documentos creados correctamente",
			data: {
				name,
				rut,
				documentCount: workerDocuments.length,
			},
		}
	} catch (error) {
		console.error("Error al agregar trabajador a la orden de trabajo:", error)
		return {
			ok: false,
			message: "Error al agregar trabajador a la orden de trabajo",
		}
	}
}
