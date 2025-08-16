"use server"

import { systemUrl } from "@/lib/consts/systemUrl"
import prisma from "@/lib/prisma"
import { resend } from "@/lib/resend"

import InspectionCommentNotificationEmail from "@/project/work-order/components/emails/InspectionCommentNotificationEmail"
import { ACCESS_ROLE } from "@prisma/client"

interface SendInspectionCommentNotificationProps {
	commentId: string
	workEntryId: string
}

export const sendInspectionCommentNotification = async ({
	commentId,
	workEntryId,
}: SendInspectionCommentNotificationProps) => {
	try {
		const comment = await prisma.inspectionComment.findUnique({
			where: { id: commentId },
			select: {
				id: true,
				content: true,
				type: true,
				createdAt: true,
				author: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				attachments: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!comment) {
			return {
				ok: false,
				error: "Comentario no encontrado",
			}
		}

		const workEntry = await prisma.workEntry.findUnique({
			where: { id: workEntryId },
			select: {
				id: true,
				activityName: true,
				executionDate: true,
				activityStartTime: true,
				activityEndTime: true,
				inspectionStatus: true,
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						workBookName: true,
						workBookLocation: true,
						responsible: {
							select: {
								name: true,
								email: true,
							},
						},
						supervisor: {
							select: {
								name: true,
								email: true,
							},
						},
						company: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		if (!workEntry) {
			return {
				ok: false,
				error: "Inspección no encontrada",
			}
		}

		const allCommentAuthors = await prisma.inspectionComment.findMany({
			where: { workEntryId },
			select: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						accessRole: true,
					},
				},
			},
			distinct: ["authorId"],
		})

		const recipients = new Map<
			string,
			{
				name: string
				email: string
				isInternal: boolean
				role: "responsible" | "supervisor"
			}
		>()

		recipients.set(workEntry.workOrder.responsible.email, {
			name: workEntry.workOrder.responsible.name,
			email: workEntry.workOrder.responsible.email,
			isInternal: true,
			role: "responsible",
		})

		recipients.set(workEntry.workOrder.supervisor.email, {
			name: workEntry.workOrder.supervisor.name,
			email: workEntry.workOrder.supervisor.email,
			isInternal: false,
			role: "supervisor",
		})

		allCommentAuthors.forEach(({ author }) => {
			if (!recipients.has(author.email)) {
				recipients.set(author.email, {
					name: author.name,
					email: author.email,
					isInternal: author.accessRole === ACCESS_ROLE.ADMIN ? true : false,
					role: author.accessRole === ACCESS_ROLE.ADMIN ? "responsible" : "supervisor",
				})
			}
		})

		recipients.delete(comment.author.email)

		const commentData = {
			id: comment.id,
			content: comment.content,
			type: comment.type,
			createdAt: comment.createdAt,
			author: {
				name: comment.author.name,
				email: comment.author.email,
			},
			attachmentCount: comment.attachments.length,
		}

		const inspectionData = {
			id: workEntry.id,
			activityName: workEntry.activityName ?? "Sin nombre",
			executionDate: workEntry.executionDate,
			activityStartTime: workEntry.activityStartTime ?? "00:00",
			activityEndTime: workEntry.activityEndTime ?? "00:00",
			inspectionStatus: workEntry.inspectionStatus?.toString() ?? "PENDING",
			isResolved: workEntry.inspectionStatus === "RESOLVED",
		}

		const workOrderData = {
			id: workEntry.workOrder.id,
			otNumber: workEntry.workOrder.otNumber,
			workBookName: workEntry.workOrder.workBookName || undefined,
			workBookLocation: workEntry.workOrder.workBookLocation || undefined,
			responsible: {
				name: workEntry.workOrder.responsible.name,
			},
			supervisor: {
				name: workEntry.workOrder.supervisor.name,
			},
			company: workEntry.workOrder.company
				? {
						name: workEntry.workOrder.company.name,
					}
				: undefined,
		}

		Array.from(recipients.values()).map(async (recipient, i) => {
			const subject = inspectionData.isResolved
				? `✅ Inspección Resuelta - OT ${workOrderData.otNumber}`
				: comment.type === "RESPONSIBLE_APPROVAL"
					? `✅ Inspección Aprobada - OT ${workOrderData.otNumber}`
					: comment.type === "RESPONSIBLE_REJECTION"
						? `❌ Inspección Rechazada - OT ${workOrderData.otNumber}`
						: `💬 Nuevo Comentario en Inspección - OT ${workOrderData.otNumber}`

			const url = recipient.isInternal
				? `${systemUrl}/admin/dashboard/ordenes-de-trabajo/${workOrderData.id}`
				: `${systemUrl}/dashboard/libro-de-obras/${workOrderData.id}`

			return resend.emails.send({
				from: "anghelo.alva@ingenieriasimple.cl",
				to: recipient.email,
				cc: i === 0 ? "soporte@ingenieriasimple.cl" : [],
				subject,
				react: await InspectionCommentNotificationEmail({
					comment: commentData,
					inspection: inspectionData,
					workOrder: workOrderData,
					recipient,
					url,
				}),
				tags: [
					{
						name: "type",
						value: "inspection-comment-notification",
					},
					{
						name: "work-order",
						value: workOrderData.otNumber,
					},
					{
						name: "comment-type",
						value: comment.type,
					},
					{
						name: "recipient-role",
						value: recipient.role,
					},
				],
			})
		})

		return {
			ok: true,
		}
	} catch (error) {
		console.error("[SEND_INSPECTION_COMMENT_NOTIFICATION]", error)
		return {
			ok: false,
			error: "Error al enviar notificaciones",
		}
	}
}
