"use server"

import { headers } from "next/headers"

import { sendOtcInspectionNotification } from "./sendOtcInspectionNotification"
import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { OtcInspectionSchema } from "@/project/work-order/schemas/otc-inspections.schema"

interface CreateOtcInspectionsProps {
	userId: string
	values: OtcInspectionSchema
	attachment?: UploadFilesResult[]
}

export const createOtcInspections = async ({
	values,
	userId,
	attachment,
}: CreateOtcInspectionsProps) => {
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
		const { workOrderId, milestoneId, inspectionName, ...rest } = values

		return await prisma.$transaction(async (tx) => {
			const newWorkEntry = await tx.workEntry.create({
				data: {
					entryType: "OTC_INSPECTION",
					...rest,
					...(attachment && {
						attachments: {
							create: attachment.map((file) => ({
								name: file.name,
								type: file.type,
								url: file.url,
							})),
						},
					}),
					createdById: userId,
					activityName: inspectionName,
					workOrderId: workOrderId,
					...(milestoneId && {
						milestoneId: milestoneId,
					}),
				},
				select: {
					id: true,
					entryType: true,
					nonConformities: true,
					workOrderId: true,
					createdById: true,
					workOrder: {
						select: {
							id: true,
							otNumber: true,
							company: {
								select: {
									id: true,
								},
							},
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

			logActivity({
				userId: session.user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: newWorkEntry.id,
				entityType: "WorkEntry",
				metadata: {
					entryType: newWorkEntry.entryType,
					nonConformities: newWorkEntry.nonConformities,
					attachments: newWorkEntry.attachments,
					workOrderId: newWorkEntry.workOrderId,
					createdById: newWorkEntry.createdById,
					workOrder: {
						id: newWorkEntry.workOrder.id,
						otNumber: newWorkEntry.workOrder.otNumber,
						company: {
							id: newWorkEntry?.workOrder?.company?.id,
						},
					},
				},
			})

			sendOtcInspectionNotification({ workEntryId: newWorkEntry.id })

			return {
				ok: true,
				message: "Inspección creada exitosamente",
				inspectionId: newWorkEntry.id,
			}
		})
	} catch (error) {
		console.error("[CREATE_OTC_INSPECTION]", error)
		return {
			ok: false,
			message: "Error al crear el inspector",
		}
	}
}
