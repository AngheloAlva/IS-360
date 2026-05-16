import { ACTIVITY_TYPE, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"
import { SYSTEM_USER_ID } from "@/lib/consts/system-user"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"

interface AutoApproveContext {
	folderTable: string
	documentTable: string
	entityLogType: string
}

async function autoApproveFolder(
	ctx: AutoApproveContext,
	folder: { id: string; status: ReviewStatus },
	docs: { status: ReviewStatus }[],
	totalDocuments: number,
	metadata: Record<string, unknown>,
): Promise<boolean> {
	const allApproved =
		docs.every(
			(d) => d.status === ReviewStatus.APPROVED || d.status === ReviewStatus.NOT_APPLIED,
		) && docs.length >= totalDocuments

	if (!allApproved) return false

	const db = await getDemoDb()
	const now = new Date().toISOString()
	await db.query(
		`UPDATE "${ctx.folderTable}" SET status = $1, "reviewerId" = $2, "updatedAt" = $3 WHERE id = $4`,
		[ReviewStatus.APPROVED, SYSTEM_USER_ID, now, folder.id],
	)

	try {
		const diff = createDiff(
			{ status: folder.status, reviewerId: null },
			{ status: ReviewStatus.APPROVED, reviewerId: SYSTEM_USER_ID },
		)
		await logActivity({
			userId: SYSTEM_USER_ID,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.APPROVE,
			entityId: folder.id,
			entityType: ctx.entityLogType,
			...diff,
			metadata: { autoApproved: true, ...metadata, totalDocuments },
		})
	} catch {
		// audit best-effort
	}

	return true
}

export async function autoApproveBasicFolderIfReady(
	workerId: string,
	startupFolderId: string,
): Promise<boolean> {
	try {
		const db = await getDemoDb()
		const folderRes = await db.query<{ id: string; status: ReviewStatus }>(
			`SELECT id, status FROM "basic_folder"
			 WHERE "workerId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
			[workerId, startupFolderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) return false
		if (folder.status === ReviewStatus.APPROVED) return true

		const docsRes = await db.query<{ status: ReviewStatus }>(
			`SELECT status FROM "basic_document" WHERE "folderId" = $1`,
			[folder.id],
		)

		const approved = await autoApproveFolder(
			{
				folderTable: "basic_folder",
				documentTable: "basic_document",
				entityLogType: "BasicFolder",
			},
			folder,
			docsRes.rows,
			BASIC_FOLDER_STRUCTURE.documents.length,
			{
				reason: "Todos los documentos de la carpeta básica están aprobados o no aplican",
				workerId,
				startupFolderId,
			},
		)

		if (approved) {
			console.log(
				`Auto-approved BasicFolder for worker ${workerId} in startup folder ${startupFolderId}`,
			)
		}
		return approved
	} catch (error) {
		console.error("Error auto-approving basic folder:", error)
		return false
	}
}

export async function autoApproveWorkerFolderIfReady(
	workerId: string,
	startupFolderId: string,
): Promise<boolean> {
	try {
		const db = await getDemoDb()
		const folderRes = await db.query<{
			id: string
			status: ReviewStatus
			isDriver: boolean | null
		}>(
			`SELECT id, status, "isDriver" FROM "worker_folders"
			 WHERE "workerId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
			[workerId, startupFolderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) return false
		if (folder.status === ReviewStatus.APPROVED) return true

		const isDriver = folder.isDriver ?? true
		const totalDocuments = isDriver
			? DRIVER_WORKER_STRUCTURE.documents.length
			: BASE_WORKER_STRUCTURE.documents.length

		const docsRes = await db.query<{ status: ReviewStatus }>(
			`SELECT status FROM "worker_document" WHERE "folderId" = $1`,
			[folder.id],
		)

		const approved = await autoApproveFolder(
			{
				folderTable: "worker_folders",
				documentTable: "worker_document",
				entityLogType: "WorkerFolder",
			},
			folder,
			docsRes.rows,
			totalDocuments,
			{
				reason: "Todos los documentos del trabajador están aprobados o no aplican",
				workerId,
				startupFolderId,
				isDriver,
			},
		)

		if (approved) {
			console.log(
				`Auto-approved WorkerFolder for worker ${workerId} in startup folder ${startupFolderId}`,
			)
		}
		return approved
	} catch (error) {
		console.error("Error auto-approving worker folder:", error)
		return false
	}
}
