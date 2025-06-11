"use server"

import prisma from "@/lib/prisma"

import type { WorkOrderSchema } from "@/lib/form-schemas/admin/work-order/workOrder.schema"

interface UploadWorkOrderAttachmentProps {
	data: WorkOrderSchema
	fileUrl: string
	fileType: string
	workOrderId: string
	reportPhase: "init" | "end"
}

export const uploadWorkOrderAttachment = async ({
	data,
	fileUrl,
	fileType,
	workOrderId,
	reportPhase,
}: UploadWorkOrderAttachmentProps) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { equipment, ...rest } = data

		const result = await prisma.attachment.create({
			data: {
				...(reportPhase === "init"
					? { initReport: { connect: { id: workOrderId } } }
					: { endReport: { connect: { id: workOrderId } } }),
				url: fileUrl,
				type: fileType,
				name: data.workRequest,
			},
		})

		return {
			ok: true,
			data: result,
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			error: (error as Error).message,
		}
	}
}
