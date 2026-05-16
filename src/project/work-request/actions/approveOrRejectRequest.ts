import { sendWorkRequestStatusUpdateEmail } from "./send-work-request-status-update"
import { ACTIVITY_TYPE, MODULES, WORK_REQUEST_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface ApproveWorkRequestProps {
	userId: string
	workRequestId: string
	action: "approve" | "reject"
}

export const approveOrRejectWorkRequest = async ({
	workRequestId,
	userId,
	action,
}: ApproveWorkRequestProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const newStatus =
			action === "approve" ? WORK_REQUEST_STATUS.APPROVED : WORK_REQUEST_STATUS.CANCELLED
		const now = new Date().toISOString()

		const updateResult = await db.query<{
			id: string
			status: string
			approvalDate: string
			approvalById: string
			requestNumber: string
			description: string
		}>(
			`UPDATE "work_request"
			 SET status = $1, "approvalDate" = $2, "approvalById" = $3, "updatedAt" = $2
			 WHERE id = $4
			 RETURNING id, status, "approvalDate", "approvalById", "requestNumber", description`,
			[newStatus, now, userId, workRequestId],
		)
		const workRequest = updateResult.rows[0]
		if (!workRequest) {
			return { ok: false, message: "Solicitud no encontrada" }
		}

		const userResult = await db.query<{ name: string; email: string }>(
			`SELECT u.name, u.email
			 FROM "work_request" wr
			 JOIN "user" u ON u.id = wr."userId"
			 WHERE wr.id = $1`,
			[workRequestId],
		)
		const requestUser = userResult.rows[0]
		if (requestUser?.email) {
			try {
				await sendWorkRequestStatusUpdateEmail({
					userEmail: requestUser.email,
					userName: requestUser.name || "Usuario",
					requestNumber: workRequest.requestNumber,
					status: workRequest.status as WORK_REQUEST_STATUS,
					description: workRequest.description,
				})
			} catch {
				// email best-effort
			}
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_REQUESTS,
				action: action === "approve" ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
				entityId: workRequest.id,
				entityType: "WorkRequest",
				metadata: {
					status: workRequest.status,
					approvalDate: workRequest.approvalDate,
					approvalById: workRequest.approvalById,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message:
				action === "approve"
					? "Solicitud de trabajo aprobada exitosamente"
					: "Solicitud de trabajo rechazada exitosamente",
		}
	} catch (error) {
		console.error("[APPROVE_OR_REJECT_WORK_REQUEST]", error)
		return {
			ok: false,
			message:
				action === "approve"
					? "Error al aprobar la solicitud de trabajo"
					: "Error al rechazar la solicitud de trabajo",
		}
	}
}
