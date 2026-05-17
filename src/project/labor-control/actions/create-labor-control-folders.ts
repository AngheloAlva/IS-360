import { LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface CreatedWorkerFolder {
	workerId: string
	workerName: string
	workerRut: string
	folderId: string
}

export const createLaborControlFolders = async (companyId?: string) => {
	try {
		const sessionUser = getDemoUser()
		if (!sessionUser) {
			throw new Error("Usuario no autenticado")
		}

		const targetCompanyId = companyId || sessionUser.companyId
		if (!targetCompanyId) {
			throw new Error("ID de empresa requerido")
		}

		const db = await getDemoDb()
		const companyRes = await db.query<{ id: string; name: string }>(
			`SELECT id, name FROM "company" WHERE id = $1`,
			[targetCompanyId],
		)
		const company = companyRes.rows[0]
		if (!company) {
			throw new Error("Empresa no encontrada")
		}

		// Workers from any startup folder of the company (worker_folder or basic_folder),
		// distinct by id.
		const workersRes = await db.query<{
			id: string
			name: string
			rut: string
			email: string
		}>(
			`SELECT DISTINCT u.id, u.name, u.rut, u.email
			 FROM "user" u
			 WHERE u.id IN (
				 SELECT wf."workerId" FROM "worker_folder" wf
				 JOIN "startup_folder" sf ON sf.id = wf."startupFolderId"
				 WHERE sf."companyId" = $1
				 UNION
				 SELECT bf."workerId" FROM "basic_folder" bf
				 JOIN "startup_folder" sf ON sf.id = bf."startupFolderId"
				 WHERE sf."companyId" = $1
			 )`,
			[targetCompanyId],
		)
		const workers = workersRes.rows

		const now = new Date()
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
		const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
		const nowIso = now.toISOString()
		const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

		const existingFolderRes = await db.query<{
			id: string
			status: LABOR_CONTROL_STATUS
			createdAt: string
		}>(
			`SELECT id, status, "createdAt" FROM "LaborControlFolder"
			 WHERE "companyId" = $1 AND "createdAt" >= $2 AND "createdAt" < $3
			 LIMIT 1`,
			[targetCompanyId, monthStart, nextMonthStart],
		)
		let folder = existingFolderRes.rows[0]
		if (!folder) {
			const id = crypto.randomUUID()
			await db.query(
				`INSERT INTO "LaborControlFolder" (
					"id", "companyId", "status", "createdAt", "updatedAt"
				) VALUES ($1, $2, $3, $4, $4)`,
				[id, targetCompanyId, LABOR_CONTROL_STATUS.DRAFT, nowIso],
			)
			folder = { id, status: LABOR_CONTROL_STATUS.DRAFT, createdAt: nowIso }
			console.log(`Carpeta de control laboral creada para ${company.name} - ${currentMonthYear}`)
		}

		const createdWorkerFolders: CreatedWorkerFolder[] = []
		const existingWorkerFolders: CreatedWorkerFolder[] = []

		for (const worker of workers) {
			const existsRes = await db.query<{ id: string }>(
				`SELECT id FROM "WorkerLaborControlFolder"
				 WHERE "workerId" = $1 AND "laborControlFolderId" = $2 LIMIT 1`,
				[worker.id, folder.id],
			)
			const existing = existsRes.rows[0]
			if (existing) {
				existingWorkerFolders.push({
					workerId: worker.id,
					workerName: worker.name,
					workerRut: worker.rut,
					folderId: existing.id,
				})
				continue
			}

			const newId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "WorkerLaborControlFolder" (
					"id", "workerId", "laborControlFolderId", "status", "createdAt", "updatedAt"
				) VALUES ($1, $2, $3, $4, $5, $5)`,
				[newId, worker.id, folder.id, LABOR_CONTROL_STATUS.DRAFT, nowIso],
			)
			createdWorkerFolders.push({
				workerId: worker.id,
				workerName: worker.name,
				workerRut: worker.rut,
				folderId: newId,
			})
		}

		return {
			success: true,
			company: { id: company.id, name: company.name },
			laborControlFolder: {
				id: folder.id,
				status: folder.status,
				createdAt: folder.createdAt,
			},
			summary: {
				totalWorkersFound: workers.length,
				newWorkerFoldersCreated: createdWorkerFolders.length,
				existingWorkerFolders: existingWorkerFolders.length,
			},
			createdWorkerFolders,
			existingWorkerFolders,
		}
	} catch (error) {
		console.error("Error creando carpetas de control laboral:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error desconocido",
			details: error,
		}
	}
}
