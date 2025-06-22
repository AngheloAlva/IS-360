"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/project/work-order/schemas/workOrder.schema"

interface AttachmentCreateData {
	url: string
	type: string
	name: string
	initReport?: { connect: { id: string } }
	endReport?: { connect: { id: string } }
}

interface UploadWorkOrderAttachmentProps {
	data: WorkOrderSchema
	fileUrl: string
	fileType: string
	workOrderId: string
	reportPhase: "init" | "end"
}

interface UploadWorkOrderAttachmentResponse {
	ok: boolean
	message?: string
}

export const uploadWorkOrderAttachment = async ({
	data,
	fileUrl,
	fileType,
	workOrderId,
	reportPhase,
}: UploadWorkOrderAttachmentProps): Promise<UploadWorkOrderAttachmentResponse> => {
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
		const attachmentData: AttachmentCreateData = {
			url: fileUrl,
			type: fileType,
			name: data.workRequest,
		}

		if (reportPhase === "init") {
			attachmentData.initReport = { connect: { id: workOrderId } }
		} else {
			attachmentData.endReport = { connect: { id: workOrderId } }
		}

		const createdAttachment = await prisma.attachment.create({
			data: attachmentData,
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: workOrderId,
			entityType: "WorkOrder",
			metadata: {
				fileUrl,
				fileType,
				name: data.workRequest,
				reportPhase,
				attachmentId: createdAttachment.id,
			},
		})

		return {
			ok: true,
			message: "Archivo subido exitosamente",
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: (error as Error).message,
		}
	}
}
