import { ACTIVITY_TYPE, MODULES, LABOR_CONTROL_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { sendCompletedNotificationEmail } from "./emails/send-completed-notification-email"

interface CompleteFolderParams {
	startupFolderId: string
}

export const completeLaborControlFolder = async ({ startupFolderId }: CompleteFolderParams) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const updateRes = await db.query<{ id: string; companyId: string }>(
			`UPDATE "LaborControlFolder"
			 SET status = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING id, "companyId"`,
			[LABOR_CONTROL_STATUS.APPROVED, now, startupFolderId],
		)
		const folder = updateRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta de control laboral no encontrada" }
		}

		const companyRes = await db.query<{ name: string }>(
			`SELECT name FROM "company" WHERE id = $1`,
			[folder.companyId],
		)
		const companyName = companyRes.rows[0]?.name ?? ""

		const supervisorsRes = await db.query<{ email: string }>(
			`SELECT email FROM "user"
			 WHERE "companyId" = $1 AND "isActive" = true AND "isSupervisor" = true`,
			[folder.companyId],
		)
		const supervisorEmails = supervisorsRes.rows.map((r) => r.email)

		await logActivity({
			entityId: folder.id,
			userId: user.id,
			action: ACTIVITY_TYPE.COMPLETE,
			entityType: "LaborControlFolder",
			module: MODULES.LABOR_CONTROL_FOLDERS,
			metadata: { companyName },
		})

		try {
			const folderName = `Control Laboral - ${companyName} - ${new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`
			await sendCompletedNotificationEmail({
				emails: supervisorEmails,
				folderName,
				companyName,
				completeDate: new Date(),
				completedBy: {
					name: user.name,
					email: user.email,
					phone: null,
				},
			})
		} catch (emailError) {
			console.error("Error al enviar email de notificación de completado:", emailError)
		}

		return { ok: true, message: "Carpeta de control laboral completada correctamente" }
	} catch (error) {
		console.error("Error al completar la carpeta de control laboral:", error)
		return { ok: false, message: "Error al completar la carpeta de control laboral" }
	}
}
