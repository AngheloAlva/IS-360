"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { LABOR_CONTROL_STATUS } from "@prisma/client"
import { headers } from "next/headers"

export const createLaborControlFolders = async (companyId?: string) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})
		if (!session?.user?.id) {
			throw new Error("Usuario no autenticado")
		}

		const targetCompanyId = companyId || session.user.companyId
		if (!targetCompanyId) {
			throw new Error("ID de empresa requerido")
		}

		const company = await prisma.company.findUnique({
			where: { id: targetCompanyId },
		})

		if (!company) {
			throw new Error("Empresa no encontrada")
		}

		// Obtener todos los trabajadores únicos de las carpetas de arranque de la empresa
		// Incluye tanto WorkerFolder como BasicFolder
		const workersFromStartupFolders = await prisma.user.findMany({
			where: {
				OR: [
					// Trabajadores en WorkerFolder
					{
						workerFolder: {
							some: {
								startupFolder: {
									companyId: targetCompanyId,
								},
							},
						},
					},
					// Trabajadores en BasicFolder
					{
						basicFolder: {
							some: {
								startupFolder: {
									companyId: targetCompanyId,
								},
							},
						},
					},
				],
			},
			select: {
				id: true,
				name: true,
				rut: true,
				email: true,
			},
			distinct: ["id"], // Evitar duplicados si un trabajador está en ambos tipos de carpetas
		})

		console.log(
			`Encontrados ${workersFromStartupFolders.length} trabajadores únicos para la empresa ${company.name}`
		)

		// Crear la carpeta de control laboral para este mes
		const currentDate = new Date()
		const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

		// Verificar si ya existe una carpeta para este mes
		let laborControlFolder = await prisma.laborControlFolder.findFirst({
			where: {
				companyId: targetCompanyId,
				createdAt: {
					gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
					lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
				},
			},
		})

		// Si no existe, crear la carpeta principal
		if (!laborControlFolder) {
			laborControlFolder = await prisma.laborControlFolder.create({
				data: {
					companyId: targetCompanyId,
					status: LABOR_CONTROL_STATUS.DRAFT,
				},
			})
			console.log(`Carpeta de control laboral creada para ${company.name} - ${currentMonthYear}`)
		} else {
			console.log(`Ya existe carpeta de control laboral para ${company.name} - ${currentMonthYear}`)
		}

		// Crear subcarpetas para cada trabajador (si no existen)
		const createdWorkerFolders = []
		const existingWorkerFolders = []

		for (const worker of workersFromStartupFolders) {
			// Verificar si ya existe una subcarpeta para este trabajador en esta carpeta de control laboral
			const existingWorkerFolder = await prisma.workerLaborControlFolder.findFirst({
				where: {
					workerId: worker.id,
					laborControlFolderId: laborControlFolder.id,
				},
			})

			if (!existingWorkerFolder) {
				const workerFolder = await prisma.workerLaborControlFolder.create({
					data: {
						workerId: worker.id,
						laborControlFolderId: laborControlFolder.id,
						status: LABOR_CONTROL_STATUS.DRAFT,
					},
				})
				createdWorkerFolders.push({
					workerId: worker.id,
					workerName: worker.name,
					workerRut: worker.rut,
					folderId: workerFolder.id,
				})
			} else {
				existingWorkerFolders.push({
					workerId: worker.id,
					workerName: worker.name,
					workerRut: worker.rut,
					folderId: existingWorkerFolder.id,
				})
			}
		}

		const result = {
			success: true,
			company: {
				id: company.id,
				name: company.name,
			},
			laborControlFolder: {
				id: laborControlFolder.id,
				status: laborControlFolder.status,
				createdAt: laborControlFolder.createdAt,
			},
			summary: {
				totalWorkersFound: workersFromStartupFolders.length,
				newWorkerFoldersCreated: createdWorkerFolders.length,
				existingWorkerFolders: existingWorkerFolders.length,
			},
			createdWorkerFolders,
			existingWorkerFolders,
		}

		console.log("Resultado:", result)
		return result
	} catch (error) {
		console.error("Error creando carpetas de control laboral:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error desconocido",
			details: error,
		}
	}
}

// Resultado: {
//   success: true,
//   company: { id: 'cm9u473j90000yi0v60wxjid7', name: 'Ingenieria Simple SPA' },
//   laborControlFolder: {
//     id: 'ee1bce43-a693-4ca4-9f35-c5b02fcd8418',
//     status: 'DRAFT',
//     createdAt: 2025-09-22T21:57:19.443Z
//   },
//   summary: {
//     totalWorkersFound: 7,
//     newWorkerFoldersCreated: 7,
//     existingWorkerFolders: 0
//   },
//   createdWorkerFolders: [
//     {
//       workerId: '3mvsuglWe4yRZN69uYsqwFchc9zWVld3',
//       workerName: 'Reilly Urtecho Abanto',
//       workerRut: '22.240.823-7',
//       folderId: '1c88da95-d800-493c-8a34-0b95ba8f9e89'
//     },
//     {
//       workerId: 'GJi5DkEwdvsIUaEAywvW46RykPWZmbAX',
//       workerName: 'Camilo Fernandez',
//       workerRut: '19.185.273-7',
//       folderId: '6a41d0b0-5c22-4b06-b6a1-b1b5b39d53d3'
//     },
//     {
//       workerId: 'gbqNFfcTFZm8PPVmEwcn5K1O8Ik752jR',
//       workerName: 'Tomás Miguel Ayun Burgos Alarcón',
//       workerRut: '19.842.491-9',
//       folderId: 'bc52b201-6aad-417b-a37c-3c2b8a297c05'
//     },
//     {
//       workerId: 'tMMCZDimmfvh9YTY1ykJ6gaGrqCHD6QM',
//       workerName: 'Renato Alonso Villegas Pacheco',
//       workerRut: '21.128.363-7',
//       folderId: '1cc26bf6-b236-4a77-9f8f-7f539f441b4e'
//     },
//     {
//       workerId: 'dOdGK4f0iL4W9CMpdzbg0vef4FCwot1D',
//       workerName: 'Anghelo Alva',
//       workerRut: '23.583.200-3',
//       folderId: '19f57e14-4214-401e-bf54-f66d7284c5e1'
//     },
//     {
//       workerId: '6NgpNoJuAzqFfJzfLftNW9PcKXqUuSOC',
//       workerName: 'David Leuman León',
//       workerRut: '13.495.396-9',
//       folderId: 'edd7af50-f464-43fd-a5fb-62f8b6a9b16c'
//     },
//     {
//       workerId: 'VrYHGQ25ZjVn2bgaSsGylX7BvRhkjUhi',
//       workerName: 'Ignacia Cardenas Basso',
//       workerRut: '20.431.828-k',
//       folderId: '2b1f8fac-12dc-48a7-ae0a-fb441cd2d7a8'
//     }
//   ],
//   existingWorkerFolders: []
// }
