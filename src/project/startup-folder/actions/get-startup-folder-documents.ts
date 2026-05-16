import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import {
	SAFETY_AND_HEALTH_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { getDemoDb } from "@/lib/demo-db/client"

import type {
	StartupFolderDocument,
	TechSpecsStartupFolderDocument,
	EnvironmentStartupFolderDocument,
	EnvironmentalStartupFolderDocument,
	SafetyAndHealthStartupFolderDocument,
} from "../types"

const CATEGORY_TO_TABLES: Partial<
	Record<DocumentCategory, { folderTable: string; documentTable: string }>
> = {
	[DocumentCategory.SAFETY_AND_HEALTH]: {
		folderTable: "safety_and_health_folder",
		documentTable: "safety_and_health_document",
	},
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
}

export async function getStartupFolderDocuments({
	startupFolderId,
	category,
}: {
	startupFolderId: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}): Promise<{
	documents: StartupFolderDocument[]
	folderStatus: ReviewStatus
	totalDocuments: number
	approvedDocuments: number
	isDriver: boolean
}> {
	try {
		const tables = CATEGORY_TO_TABLES[category]
		if (!tables) throw new Error(`Invalid category: ${category}`)

		const db = await getDemoDb()
		const folderRes = await db.query<{ id: string; status: ReviewStatus }>(
			`SELECT id, status FROM "${tables.folderTable}" WHERE "startupFolderId" = $1 LIMIT 1`,
			[startupFolderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return {
				documents: [],
				folderStatus: ReviewStatus.DRAFT,
				totalDocuments: 0,
				approvedDocuments: 0,
				isDriver: false,
			}
		}

		const docsRes = await db.query<{
			id: string
			url: string
			name: string
			type: string
			status: ReviewStatus
			folderId: string
			reviewerId: string | null
			uploadedAt: Date
			reviewedAt: Date | null
			reviewNotes: string | null
			submittedAt: Date | null
			uploadedById: string | null
			expirationDate: Date | null
			uploaded_name: string | null
			uploaded_rut: string | null
			uploaded_email: string | null
			uploaded_phone: string | null
			uploaded_image: string | null
			reviewer_name: string | null
			reviewer_rut: string | null
			reviewer_email: string | null
			reviewer_phone: string | null
			reviewer_image: string | null
		}>(
			`SELECT d.id, d.url, d.name, d.type, d.status, d."folderId", d."reviewerId",
			        d."uploadedAt", d."reviewedAt", d."reviewNotes", d."submittedAt",
			        d."uploadedById", d."expirationDate",
			        u.name AS uploaded_name, u.rut AS uploaded_rut, u.email AS uploaded_email,
			        u.phone AS uploaded_phone, u.image AS uploaded_image,
			        r.name AS reviewer_name, r.rut AS reviewer_rut, r.email AS reviewer_email,
			        r.phone AS reviewer_phone, r.image AS reviewer_image
			 FROM "${tables.documentTable}" d
			 LEFT JOIN "user" u ON u.id = d."uploadedById"
			 LEFT JOIN "user" r ON r.id = d."reviewerId"
			 WHERE d."folderId" = $1
			 ORDER BY d.name DESC`,
			[folder.id],
		)

		const documents: StartupFolderDocument[] = docsRes.rows.map((d) => {
			const baseDoc = {
				id: d.id,
				url: d.url,
				name: d.name,
				status: d.status,
				folderId: d.folderId,
				reviewerId: d.reviewerId,
				reviewer: d.reviewerId
					? {
							id: d.reviewerId,
							name: d.reviewer_name ?? "",
							rut: d.reviewer_rut ?? "",
							email: d.reviewer_email ?? "",
							phone: d.reviewer_phone ?? "",
							image: d.reviewer_image ?? "",
						}
					: null,
				uploadedAt: d.uploadedAt,
				reviewedAt: d.reviewedAt,
				reviewNotes: d.reviewNotes,
				submittedAt: d.submittedAt,
				uploadedById: d.uploadedById,
				expirationDate: d.expirationDate,
				uploadedBy: d.uploadedById
					? {
							id: d.uploadedById,
							name: d.uploaded_name ?? "",
							rut: d.uploaded_rut ?? "",
							email: d.uploaded_email ?? "",
							phone: d.uploaded_phone ?? "",
							image: d.uploaded_image ?? "",
						}
					: null,
			}

			switch (category) {
				case DocumentCategory.SAFETY_AND_HEALTH:
					return {
						...baseDoc,
						category: "SAFETY_AND_HEALTH",
						type: d.type,
					} as SafetyAndHealthStartupFolderDocument
				case DocumentCategory.ENVIRONMENTAL:
					return {
						...baseDoc,
						category: "ENVIRONMENTAL",
						type: d.type,
					} as EnvironmentalStartupFolderDocument
				case DocumentCategory.ENVIRONMENT:
					return {
						...baseDoc,
						category: "ENVIRONMENT",
						type: d.type,
					} as EnvironmentStartupFolderDocument
				case DocumentCategory.TECHNICAL_SPECS:
					return {
						...baseDoc,
						category: "TECHNICAL_SPECS",
						type: d.type,
					} as TechSpecsStartupFolderDocument
				default:
					throw new Error(`Invalid category: ${category}`)
			}
		})

		const expectedTypes = await (async (): Promise<string[]> => {
			switch (category) {
				case DocumentCategory.SAFETY_AND_HEALTH:
					return SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type)
				case DocumentCategory.ENVIRONMENTAL:
					return ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type)
				case DocumentCategory.ENVIRONMENT: {
					const meta = await db.query<{ moreMonthDuration: boolean }>(
						`SELECT "moreMonthDuration" FROM "startup_folder" WHERE id = $1 LIMIT 1`,
						[startupFolderId],
					)
					return (
						meta.rows[0]?.moreMonthDuration
							? EXTENDED_ENVIRONMENT_STRUCTURE
							: ENVIRONMENT_STRUCTURE
					).documents.map((d) => d.type)
				}
				case DocumentCategory.TECHNICAL_SPECS:
					return TECH_SPEC_STRUCTURE.documents.map((d) => d.type)
				default:
					return []
			}
		})()

		const satisfiedTypes = new Set<string>()
		for (const doc of documents) {
			if (
				expectedTypes.includes(doc.type) &&
				(doc.status === ReviewStatus.APPROVED || doc.status === ReviewStatus.NOT_APPLIED)
			) {
				satisfiedTypes.add(doc.type)
			}
		}

		return {
			documents,
			folderStatus: folder.status,
			totalDocuments: expectedTypes.length,
			approvedDocuments: satisfiedTypes.size,
			isDriver: false,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
