"use server"

import prisma from "@/lib/prisma"

import type { WorkPermitAttachmentSchema } from "@/project/work-permit/schemas/work-permit-attachment.schema"
import type { UploadResult } from "@/lib/upload-files"

export const addWorkPermitAttachment = async (
	values: WorkPermitAttachmentSchema,
	uploadedFile: UploadResult
) => {
	try {
		const { userId, workPermitId } = values

		await prisma.workPermitAttachment.create({
			data: {
				name: uploadedFile.name,
				url: uploadedFile.url,
				type: uploadedFile.type,
				size: uploadedFile.size,
				uploadedAt: new Date(),
				uploadedBy: {
					connect: {
						id: userId,
					},
				},
				workPermit: {
					connect: {
						id: workPermitId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Archivo adjuntado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al adjuntar el archivo",
		}
	}
}
