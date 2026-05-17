import { z } from "zod"

import { ACTIVITY_TYPE, LABOR_CONTROL_STATUS, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { systemUrl } from "@/lib/consts/systemUrl"
import { getDemoDb } from "@/lib/demo-db/client"
import { generateSlug } from "@/lib/generateSlug"

import { sendRequestReviewEmail } from "./emails/send-request-review-email"

export const submitLaborControlFolderForReview = async ({
	userId,
	folderId,
}: {
	userId: string
	folderId: string
}) => {
	try {
		const db = await getDemoDb()

		const userRes = await db.query<{
			rut: string
			name: string
			email: string
			phone: string | null
			companyId: string | null
		}>(
			`SELECT rut, name, email, phone, "companyId" FROM "user" WHERE id = $1`,
			[userId],
		)
		const user = userRes.rows[0]
		if (!user) {
			return { ok: false, message: "Usuario no encontrado." }
		}

		const folderRes = await db.query<{
			id: string
			companyFolderStatus: LABOR_CONTROL_STATUS
			companyId: string
			companyName: string
		}>(
			`SELECT lcf.id, lcf."companyFolderStatus", lcf."companyId", c.name AS "companyName"
			 FROM "LaborControlFolder" lcf
			 LEFT JOIN "company" c ON c.id = lcf."companyId"
			 WHERE lcf.id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (
			folder.companyFolderStatus !== LABOR_CONTROL_STATUS.DRAFT &&
			folder.companyFolderStatus !== LABOR_CONTROL_STATUS.REJECTED
		) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.companyFolderStatus}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		const now = new Date().toISOString()

		await db.query(
			`UPDATE "LaborControlFolder"
			 SET emails = $1, "companyFolderStatus" = $2, "updatedAt" = $3
			 WHERE id = $4`,
			[[user.email], LABOR_CONTROL_STATUS.SUBMITTED, now, folderId],
		)

		const docsRes = await db.query<{ id: string; status: LABOR_CONTROL_STATUS }>(
			`SELECT id, status FROM "LaborControlDocument" WHERE "folderId" = $1`,
			[folderId],
		)

		for (const doc of docsRes.rows) {
			const newStatus =
				doc.status === LABOR_CONTROL_STATUS.APPROVED
					? LABOR_CONTROL_STATUS.APPROVED
					: LABOR_CONTROL_STATUS.SUBMITTED
			await db.query(
				`UPDATE "LaborControlDocument"
				 SET status = $1, "uploadDate" = $2, "updatedAt" = $2
				 WHERE id = $3`,
				[newStatus, now, doc.id],
			)
		}

		await logActivity({
			userId,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			action: ACTIVITY_TYPE.SUBMIT,
			entityId: folder.id,
			entityType: "LaborControlFolder",
			metadata: {
				documentsCount: docsRes.rows.length,
				previousStatus: folder.companyFolderStatus,
				newStatus: LABOR_CONTROL_STATUS.SUBMITTED,
				companyId: folder.companyId,
				companyName: folder.companyName,
			},
		})

		try {
			const companySlug = generateSlug(folder.companyName || "")
			const folderName = `Control Laboral - ${folder.companyName} - ${new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`
			await sendRequestReviewEmail({
				folderName,
				reviewUrl: `${systemUrl}/admin/dashboard/control-laboral/${companySlug}_${folder.companyId}`,
				companyName: folder.companyName,
				solicitationDate: new Date(),
				solicitator: {
					rut: user.rut,
					name: user.name,
					email: user.email,
					phone: user.phone,
				},
			})
		} catch (emailError) {
			console.error("Error al enviar email de notificación:", emailError)
		}

		return {
			ok: true,
			message: "Los documentos han sido enviados a revisión correctamente.",
		}
	} catch (error) {
		console.error("Error al enviar los documentos a revisión:", error)
		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Error de validación: " + error.issues.map((e) => e.message).join(", "),
			}
		}
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}
