"use server"

import { headers } from "next/headers"

import { sendInspectionCommentNotification } from "./sendInspectionCommentNotification"
import { ACTIVITY_TYPE, MODULES, INSPECTION_COMMENT_TYPE } from "@prisma/client"
import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CreateInspectionCommentProps {
	userId: string
	workEntryId: string
	content: string
	type: INSPECTION_COMMENT_TYPE
	attachment?: UploadFilesResult[]
}

export const createInspectionComment = async ({
	userId,
	workEntryId,
	content,
	type,
	attachment,
}: CreateInspectionCommentProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const workEntry = await prisma.workEntry.findUnique({
			where: { id: workEntryId },
			select: {
				id: true,
				entryType: true,
				inspectionStatus: true,
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						supervisorId: true,
						responsibleId: true,
						company: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		})

		if (!workEntry || workEntry.entryType !== "OTC_INSPECTION") {
			return {
				ok: false,
				message: "Inspección no encontrada",
			}
		}

		return await prisma.$transaction(async (tx) => {
			const newComment = await tx.inspectionComment.create({
				data: {
					content,
					type,
					authorId: userId,
					workEntryId,
					...(attachment && {
						attachments: {
							create: attachment.map((file) => ({
								name: file.name,
								type: file.type,
								url: file.url,
							})),
						},
					}),
				},
				select: {
					id: true,
					content: true,
					type: true,
					createdAt: true,
					author: {
						select: {
							id: true,
							name: true,
						},
					},
					attachments: {
						select: {
							id: true,
							name: true,
							type: true,
							url: true,
						},
					},
				},
			})

			if (type === "RESPONSIBLE_APPROVAL") {
				await tx.workEntry.update({
					where: { id: workEntryId },
					data: { inspectionStatus: "RESOLVED" },
				})
			}

			logActivity({
				userId: session.user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: newComment.id,
				entityType: "InspectionComment",
				metadata: {
					commentType: type,
					workEntryId,
					workOrderId: workEntry.workOrder.id,
					companyName: workEntry.workOrder.company?.name,
				},
			})

			sendInspectionCommentNotification({
				commentId: newComment.id,
				workEntryId,
			})

			return {
				ok: true,
				message: "Comentario creado exitosamente",
				comment: newComment,
			}
		})
	} catch (error) {
		console.error("[CREATE_INSPECTION_COMMENT]", error)
		return {
			ok: false,
			message: "Error al crear el comentario",
		}
	}
}
