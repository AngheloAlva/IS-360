import { format } from "date-fns"
import { es } from "date-fns/locale"

import { LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { MODULES, ACTIVITY_TYPE, LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { sendReviewNotificationEmail } from "./emails/send-review-notification-email"

interface AddDocumentReviewProps {
	comments: string
	folderId: string
	workerId?: string
	documentId: string
	reviewerId: string
	status: "APPROVED" | "REJECTED"
}

interface DocStatusRow {
	name: string
	status: LABOR_CONTROL_STATUS
	reviewNotes: string | null
}

function isFolderApproved(allDocs: DocStatusRow[], totalRequired: number) {
	const completed = allDocs.filter(
		(d) =>
			d.status === LABOR_CONTROL_STATUS.APPROVED ||
			d.status === LABOR_CONTROL_STATUS.NOT_APPLIED,
	)
	return (
		allDocs.every(
			(d) =>
				d.status === LABOR_CONTROL_STATUS.APPROVED ||
				d.status === LABOR_CONTROL_STATUS.NOT_APPLIED,
		) && completed.length >= totalRequired
	)
}

function isFolderRejected(allDocs: DocStatusRow[], totalRequired: number) {
	return (
		(allDocs.some((d) => d.status === LABOR_CONTROL_STATUS.REJECTED) ||
			allDocs.length < totalRequired) &&
		allDocs.every((d) => d.status !== LABOR_CONTROL_STATUS.SUBMITTED)
	)
}

export const addDocumentReview = async ({
	status,
	comments,
	folderId,
	workerId,
	documentId,
	reviewerId,
}: AddDocumentReviewProps): Promise<{ ok: boolean; message: string }> => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No se encontro usuario" }
	}

	try {
		const db = await getDemoDb()
		const newStatus =
			status === LABOR_CONTROL_STATUS.APPROVED
				? LABOR_CONTROL_STATUS.APPROVED
				: LABOR_CONTROL_STATUS.REJECTED
		const now = new Date()
		const nowIso = now.toISOString()

		await logActivity({
			userId: reviewerId,
			entityId: documentId,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			action:
				newStatus === LABOR_CONTROL_STATUS.APPROVED
					? ACTIVITY_TYPE.APPROVE
					: ACTIVITY_TYPE.REJECT,
			entityType: "LaborControlDocument",
			metadata: { comments, folderId },
		})

		const totalDocuments = LABOR_CONTROL_STRUCTURE.length

		if (!workerId) {
			const updateRes = await db.query<{ folderId: string }>(
				`UPDATE "LaborControlDocument"
				 SET "reviewNotes" = $1, "reviewDate" = $2, status = $3, "reviewById" = $4, "updatedAt" = $2
				 WHERE id = $5
				 RETURNING "folderId"`,
				[comments, nowIso, newStatus, reviewerId, documentId],
			)
			const updatedFolderId = updateRes.rows[0]?.folderId
			if (!updatedFolderId) {
				return { ok: false, message: "Documento no encontrado" }
			}

			const folderInfoRes = await db.query<{
				emails: string[] | null
				createdAt: string
				companyName: string
			}>(
				`SELECT lcf.emails, lcf."createdAt", c.name AS "companyName"
				 FROM "LaborControlFolder" lcf
				 LEFT JOIN "company" c ON c.id = lcf."companyId"
				 WHERE lcf.id = $1`,
				[updatedFolderId],
			)
			const folderInfo = folderInfoRes.rows[0]
			const emails = folderInfo?.emails ?? []
			const companyName = folderInfo?.companyName ?? ""
			const createdAt = folderInfo?.createdAt ? new Date(folderInfo.createdAt) : now

			const allDocsRes = await db.query<DocStatusRow>(
				`SELECT name, status, "reviewNotes" FROM "LaborControlDocument" WHERE "folderId" = $1`,
				[updatedFolderId],
			)
			const allDocuments = allDocsRes.rows

			if (isFolderApproved(allDocuments, totalDocuments)) {
				await db.query(
					`UPDATE "LaborControlFolder"
					 SET "companyFolderStatus" = $1, "updatedAt" = $2
					 WHERE id = $3`,
					[LABOR_CONTROL_STATUS.APPROVED, nowIso, updatedFolderId],
				)
				await sendReviewNotificationEmail({
					folderName: `Carpeta ${format(createdAt, "MMMM yyyy", { locale: es })} - Acreditación Empresa`,
					companyName,
					reviewDate: now,
					reviewer: {
						name: sessionUser.name,
						email: sessionUser.email,
						phone: null,
					},
					isApproved: true,
					emails,
				})
				return { ok: true, message: "Revisión procesada exitosamente " }
			}

			if (isFolderRejected(allDocuments, totalDocuments)) {
				await db.query(
					`UPDATE "LaborControlFolder"
					 SET "companyFolderStatus" = $1, "updatedAt" = $2
					 WHERE id = $3`,
					[LABOR_CONTROL_STATUS.DRAFT, nowIso, updatedFolderId],
				)
				await sendReviewNotificationEmail({
					folderName: `Carpeta ${format(createdAt, "MMMM yyyy", { locale: es })} - Acreditación Empresa`,
					companyName,
					reviewDate: now,
					reviewer: {
						name: sessionUser.name,
						email: sessionUser.email,
						phone: null,
					},
					isApproved: false,
					rejectedDocuments: allDocuments
						.filter((d) => d.status === LABOR_CONTROL_STATUS.REJECTED)
						.map((d) => ({ name: d.name, reason: d.reviewNotes ?? "" })),
					emails,
				})
			}

			return { ok: true, message: "Revisión procesada exitosamente" }
		}

		// Worker branch
		const workerRes = await db.query<{ name: string; companyName: string | null }>(
			`SELECT u.name, c.name AS "companyName"
			 FROM "user" u LEFT JOIN "company" c ON c.id = u."companyId"
			 WHERE u.id = $1`,
			[workerId],
		)
		const worker = workerRes.rows[0]

		const updateWorkerRes = await db.query<{ folderId: string }>(
			`UPDATE "WorkerLaborControlDocument"
			 SET "reviewNotes" = $1, "reviewDate" = $2, status = $3, "reviewById" = $4, "updatedAt" = $2
			 WHERE id = $5
			 RETURNING "folderId"`,
			[comments, nowIso, newStatus, reviewerId, documentId],
		)
		const updatedFolderId = updateWorkerRes.rows[0]?.folderId
		if (!updatedFolderId) {
			return { ok: false, message: "Documento no encontrado" }
		}

		const folderInfoRes = await db.query<{ emails: string[] | null; createdAt: string }>(
			`SELECT emails, "createdAt" FROM "WorkerLaborControlFolder" WHERE id = $1`,
			[updatedFolderId],
		)
		const folderInfo = folderInfoRes.rows[0]
		const emails = folderInfo?.emails ?? []
		const createdAt = folderInfo?.createdAt ? new Date(folderInfo.createdAt) : now

		const allDocsRes = await db.query<DocStatusRow>(
			`SELECT name, status, "reviewNotes"
			 FROM "WorkerLaborControlDocument" WHERE "folderId" = $1`,
			[updatedFolderId],
		)
		const allDocuments = allDocsRes.rows

		if (isFolderApproved(allDocuments, totalDocuments)) {
			await db.query(
				`UPDATE "WorkerLaborControlFolder"
				 SET status = $1, "updatedAt" = $2
				 WHERE id = $3`,
				[LABOR_CONTROL_STATUS.APPROVED, nowIso, updatedFolderId],
			)
			await sendReviewNotificationEmail({
				folderName: `Carpeta ${format(createdAt, "MMMM yyyy", { locale: es })} - Acreditación Trabajador: ${worker?.name ?? ""}`,
				companyName: worker?.companyName ?? "",
				reviewDate: now,
				reviewer: {
					name: sessionUser.name,
					email: sessionUser.email,
					phone: null,
				},
				isApproved: true,
				emails,
			})
			return { ok: true, message: "Revisión procesada exitosamente " }
		}

		if (isFolderRejected(allDocuments, totalDocuments)) {
			await db.query(
				`UPDATE "WorkerLaborControlFolder"
				 SET status = $1, "updatedAt" = $2
				 WHERE id = $3`,
				[LABOR_CONTROL_STATUS.DRAFT, nowIso, updatedFolderId],
			)
			await sendReviewNotificationEmail({
				folderName: `Carpeta ${format(createdAt, "MMMM yyyy", { locale: es })} - Acreditación Trabajador: ${worker?.name ?? ""}`,
				companyName: worker?.companyName ?? "",
				reviewDate: now,
				reviewer: {
					name: sessionUser.name,
					email: sessionUser.email,
					phone: null,
				},
				isApproved: false,
				rejectedDocuments: allDocuments
					.filter((d) => d.status === LABOR_CONTROL_STATUS.REJECTED)
					.map((d) => ({ name: d.name, reason: d.reviewNotes ?? "" })),
				emails,
			})
		}

		return { ok: true, message: "Revisión procesada exitosamente" }
	} catch (error) {
		console.error("Error al procesar revisión de documento:", error)
		if (error instanceof Error) {
			return { ok: false, message: `Error al procesar la revisión: ${error.message}` }
		}
		return { ok: false, message: "Ocurrió un error inesperado al procesar la revisión" }
	}
}
