import { NextResponse } from "next/server"

import { MODULES, ACTIVITY_TYPE, ACCESS_ROLE, LABOR_CONTROL_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface LaborControlResult {
	success: boolean
	companyId: string
	companyName: string
	laborControlFolderId?: string
	totalWorkersFound: number
	newWorkerFoldersCreated: number
	existingWorkerFolders: number
	error?: string
}

export async function GET(): Promise<NextResponse> {
	try {
		console.log("[CRON_LABOR_CONTROL] Starting monthly labor control folders creation")

		// Obtener todas las empresas activas que tienen carpetas de arranque
		const companies = await prisma.company.findMany({
			where: {
				isActive: true,
				StartupFolders: {
					some: {}, // Empresas que tienen al menos una carpeta de arranque
				},
			},
			select: {
				id: true,
				name: true,
				rut: true,
			},
		})

		console.log(`[CRON_LABOR_CONTROL] Found ${companies.length} active companies with startup folders`)

		if (companies.length === 0) {
			return NextResponse.json({
				message: "No active companies with startup folders found",
				processedCompanies: 0,
			})
		}

		const results: LaborControlResult[] = []
		const currentDate = new Date()
		const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

		// Procesar cada empresa
		for (const company of companies) {
			try {
				console.log(`[CRON_LABOR_CONTROL] Processing company: ${company.name}`)

				// Obtener todos los trabajadores únicos de las carpetas de arranque de la empresa
				const workersFromStartupFolders = await prisma.user.findMany({
					where: {
						OR: [
							// Trabajadores en WorkerFolder
							{
								workerFolder: {
									some: {
										startupFolder: {
											companyId: company.id,
										},
									},
								},
							},
							// Trabajadores en BasicFolder
							{
								basicFolder: {
									some: {
										startupFolder: {
											companyId: company.id,
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
					`[CRON_LABOR_CONTROL] Found ${workersFromStartupFolders.length} workers for company ${company.name}`
				)

				// Verificar si ya existe una carpeta para este mes
				let laborControlFolder = await prisma.laborControlFolder.findFirst({
					where: {
						companyId: company.id,
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
							companyId: company.id,
							status: LABOR_CONTROL_STATUS.DRAFT,
						},
					})
					console.log(`[CRON_LABOR_CONTROL] Created labor control folder for ${company.name} - ${currentMonthYear}`)
				} else {
					console.log(`[CRON_LABOR_CONTROL] Labor control folder already exists for ${company.name} - ${currentMonthYear}`)
				}

				// Crear subcarpetas para cada trabajador (si no existen)
				let newWorkerFoldersCreated = 0
				let existingWorkerFolders = 0

				for (const worker of workersFromStartupFolders) {
					// Verificar si ya existe una subcarpeta para este trabajador en esta carpeta de control laboral
					const existingWorkerFolder = await prisma.workerLaborControlFolder.findFirst({
						where: {
							workerId: worker.id,
							laborControlFolderId: laborControlFolder.id,
						},
					})

					if (!existingWorkerFolder) {
						await prisma.workerLaborControlFolder.create({
							data: {
								workerId: worker.id,
								laborControlFolderId: laborControlFolder.id,
								status: LABOR_CONTROL_STATUS.DRAFT,
							},
						})
						newWorkerFoldersCreated++
					} else {
						existingWorkerFolders++
					}
				}

				const result: LaborControlResult = {
					success: true,
					companyId: company.id,
					companyName: company.name,
					laborControlFolderId: laborControlFolder.id,
					totalWorkersFound: workersFromStartupFolders.length,
					newWorkerFoldersCreated,
					existingWorkerFolders,
				}

				results.push(result)
				console.log(`[CRON_LABOR_CONTROL] Completed processing for ${company.name}:`, {
					totalWorkers: workersFromStartupFolders.length,
					newFolders: newWorkerFoldersCreated,
					existingFolders: existingWorkerFolders,
				})
			} catch (companyError) {
				console.error(`[CRON_LABOR_CONTROL] Error processing company ${company.name}:`, companyError)
				results.push({
					success: false,
					companyId: company.id,
					companyName: company.name,
					totalWorkersFound: 0,
					newWorkerFoldersCreated: 0,
					existingWorkerFolders: 0,
					error: companyError instanceof Error ? companyError.message : "Unknown error",
				})
			}
		}

		// Calcular estadísticas finales
		const totalCompaniesProcessed = results.length
		const successfulCompanies = results.filter((r) => r.success).length
		const failedCompanies = results.filter((r) => !r.success).length
		const totalWorkersProcessed = results.reduce((sum, r) => sum + r.totalWorkersFound, 0)
		const totalNewFoldersCreated = results.reduce((sum, r) => sum + r.newWorkerFoldersCreated, 0)
		const totalExistingFolders = results.reduce((sum, r) => sum + r.existingWorkerFolders, 0)

		// Log de actividad del sistema
		const systemUser = await prisma.user.findFirst({
			where: {
				accessRole: ACCESS_ROLE.ADMIN,
			},
			select: {
				id: true,
			},
		})

		if (systemUser) {
			await logActivity({
				userId: systemUser.id,
				module: MODULES.LABOR_CONTROL_FOLDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityType: "LaborControlFolder",
				entityId: "cron-job-monthly",
				metadata: {
					totalCompaniesProcessed,
					successfulCompanies,
					failedCompanies,
					totalWorkersProcessed,
					totalNewFoldersCreated,
					totalExistingFolders,
					executionDate: currentDate.toISOString(),
					monthYear: currentMonthYear,
				},
			})
		}

		console.log("[CRON_LABOR_CONTROL] Monthly execution completed:", {
			totalCompaniesProcessed,
			successfulCompanies,
			failedCompanies,
			totalWorkersProcessed,
			totalNewFoldersCreated,
			totalExistingFolders,
		})

		return NextResponse.json({
			message: "Monthly labor control folders creation completed successfully",
			summary: {
				totalCompaniesProcessed,
				successfulCompanies,
				failedCompanies,
				totalWorkersProcessed,
				totalNewFoldersCreated,
				totalExistingFolders,
				monthYear: currentMonthYear,
			},
			results: results.map((r) => ({
				companyId: r.companyId,
				companyName: r.companyName,
				success: r.success,
				totalWorkers: r.totalWorkersFound,
				newFolders: r.newWorkerFoldersCreated,
				existingFolders: r.existingWorkerFolders,
				error: r.error,
			})),
		})
	} catch (error) {
		console.error("[CRON_LABOR_CONTROL_ERROR]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
