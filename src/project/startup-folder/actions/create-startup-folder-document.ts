import { z } from "zod"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

const createDocumentSchema = z.object({
	userId: z.string(),
	startupFolderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	url: z.string(),
	category: z.nativeEnum(DocumentCategory),
	workerId: z.string().optional(),
	vehicleId: z.string().optional(),
	expirationDate: z.date(),
})

export type CreateStartupFolderDocumentInput = z.infer<typeof createDocumentSchema>

const CATEGORY_TO_TABLES: Partial<
	Record<DocumentCategory, { folderTable: string; documentTable: string }>
> = {
	[DocumentCategory.ENVIRONMENTAL]: {
		folderTable: "environmental_folder",
		documentTable: "environmental_document",
	},
	[DocumentCategory.ENVIRONMENT]: {
		folderTable: "environment_folder",
		documentTable: "environment_document",
	},
	[DocumentCategory.TECHNICAL_SPECS]: {
		folderTable: "tech_specs_folder",
		documentTable: "tech_specs_document",
	},
	[DocumentCategory.SAFETY_AND_HEALTH]: {
		folderTable: "safety_and_health_folder",
		documentTable: "safety_and_health_document",
	},
}

export async function createStartupFolderDocument(input: CreateStartupFolderDocumentInput) {
	try {
		const {
			url,
			userId,
			category,
			workerId,
			vehicleId,
			documentName,
			documentType,
			expirationDate,
			startupFolderId,
		} = createDocumentSchema.parse(input)

		const db = await getDemoDb()

		const startupRes = await db.query<{ id: string; companyId: string }>(
			`SELECT id, "companyId" FROM "startup_folder" WHERE id = $1 LIMIT 1`,
			[startupFolderId],
		)
		const startupFolder = startupRes.rows[0]
		if (!startupFolder) {
			throw new Error("Startup folder not found")
		}

		const userRes = await db.query<{ companyId: string | null }>(
			`SELECT "companyId" FROM "user" WHERE id = $1 LIMIT 1`,
			[userId],
		)
		const userRow = userRes.rows[0]
		if (!userRow || userRow.companyId !== startupFolder.companyId) {
			throw new Error("Unauthorized - User does not belong to this company")
		}

		const tables = CATEGORY_TO_TABLES[category]
		if (!tables) {
			throw new Error(`Unsupported document category: ${category}`)
		}

		const folderRes = await db.query<{ id: string }>(
			`SELECT id FROM "${tables.folderTable}" WHERE "startupFolderId" = $1 LIMIT 1`,
			[startupFolderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			throw new Error(`${category} folder not found`)
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		await db.query(
			`INSERT INTO "${tables.documentTable}"
			 (id, type, name, url, "uploadedAt", category, status, "uploadedById", "folderId", "expirationDate")
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			[
				id,
				documentType,
				documentName,
				url,
				now,
				category,
				ReviewStatus.DRAFT,
				userId,
				folder.id,
				expirationDate.toISOString(),
			],
		)

		try {
			await logActivity({
				userId,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPLOAD,
				entityId: startupFolderId,
				entityType: "StartupFolderDocument",
				metadata: {
					documentName,
					documentType,
					category,
					workerId,
					vehicleId,
					documentUrl: url,
					expirationDate: expirationDate.toISOString(),
				},
			})
		} catch {
			// audit best-effort
		}

		const docRes = await db.query(`SELECT * FROM "${tables.documentTable}" WHERE id = $1`, [id])
		return docRes.rows[0]
	} catch (error) {
		console.error("Error creating startup folder document:", error)
		throw error
	}
}
