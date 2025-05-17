import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { WorkerDocumentType, USER_ROLE, ReviewStatus } from "@prisma/client"
import { WORKER_STRUCTURE } from "@/lib/consts/startup-folders-structure"

// Tipos de documentos de trabajador definidos en la estructura
const workerDocumentTypes = WORKER_STRUCTURE.documents.map(doc => doc.type) as WorkerDocumentType[]

// Función para mapear el estado del documento
const getDocumentStatus = (isRequired: boolean): ReviewStatus => {
  return isRequired ? "DRAFT" : "DRAFT"
}

export async function POST() {
	try {
		// Obtener todas las empresas
		const companies = await prisma.company.findMany({
			include: {
				users: {
					where: {
						role: {
							in: [USER_ROLE.USER, USER_ROLE.SUPERVISOR],
						},
					},
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				generalStartupFolders: true,
			},
		})

		const results = []

		// Para cada empresa
		for (const company of companies) {
			// Para cada carpeta de la empresa
			for (const folder of company.generalStartupFolders) {
				// Para cada trabajador de la empresa
				for (const worker of company.users) {
					// Verificar si ya existe una carpeta para este trabajador
					const existingFolder = await prisma.workerFolder.findFirst({
						where: {
							workerId: worker.id,
							startupFolderId: folder.id,
						},
					})

					if (!existingFolder) {
						// Crear la carpeta del trabajador
						const workerFolder = await prisma.workerFolder.create({
							data: {
								workerId: worker.id,
								startupFolderId: folder.id,
								status: "DRAFT",
							},
							include: {
								documents: true,
							},
						})

						// Crear documentos para el trabajador según la estructura definida
            for (const docType of workerDocumentTypes) {
              const docConfig = WORKER_STRUCTURE.documents.find(doc => doc.type === docType)
              
              if (docConfig) {
                await prisma.workerDocument.create({
                  data: {
                    type: docType,
                    name: docConfig.name,
                    // El campo description no está definido en el modelo
                    url: "", // URL vacía para indicar que falta subir el documento
                    fileType: "application/pdf",
                    category: WORKER_STRUCTURE.category,
                    status: getDocumentStatus(docConfig.required),
                    uploadedAt: new Date(),
                    workerFolderId: workerFolder.id,
                    folderId: folder.id,
                    uploadedById: null, // O el ID de un usuario administrador
                  },
                })
              }
            }

						results.push({
							company: company.name,
							folderId: folder.id,
							worker: worker.name,
							workerId: worker.id,
							folderCreated: true,
							documentsCreated: workerDocumentTypes.length,
						})
					} else {
						results.push({
							company: company.name,
							folderId: folder.id,
							worker: worker.name,
							workerId: worker.id,
							folderCreated: false,
							reason: "La carpeta ya existe",
						})
					}
				}
			}
		}

		return NextResponse.json({
			success: true,
			message: "Proceso completado",
			results,
		})
	} catch (error) {
		console.error("Error al generar carpetas de trabajadores:", error)
		return NextResponse.json(
			{
				success: false,
				message: "Error al generar carpetas de trabajadores",
				error: error instanceof Error ? error.message : "Error desconocido",
			},
			{ status: 500 }
		)
	}
}
