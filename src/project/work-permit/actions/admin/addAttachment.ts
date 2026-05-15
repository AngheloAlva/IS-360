"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"

import type { WorkPermitAttachmentSchema } from "@/project/work-permit/schemas/work-permit-attachment.schema"
import type { UploadResult } from "@/lib/upload-files"

export const addWorkPermitAttachment = async (
	values: WorkPermitAttachmentSchema,
	uploadedFile: UploadResult
) => {
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
		const { workPermitId } = values

		const hasPermission = await hasWorkPermitUpdatePermission(session.user.id)

		if (!hasPermission) {
			return {
				ok: false,
				message: "No tienes permisos para adjuntar archivos",
			}
		}

		const scopedWorkPermitId = await getScopedWorkPermitId({
			workPermitId,
			userId: session.user.id,
		})

		if (!scopedWorkPermitId) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

		const attachment = await prisma.workPermitAttachment.create({
			data: {
				name: uploadedFile.name,
				url: uploadedFile.url,
				type: uploadedFile.type,
				size: uploadedFile.size,
				uploadedAt: new Date(),
				uploadedBy: {
					connect: {
						id: session.user.id,
					},
				},
				workPermit: {
					connect: {
						id: scopedWorkPermitId,
					},
				},
			},
			select: {
				id: true,
				name: true,
				url: true,
				type: true,
				size: true,
				uploadedAt: true,
				workPermitId: true,
				uploadedById: true,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_PERMITS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: attachment.id,
			entityType: "WorkPermitAttachment",
			metadata: {
				name: attachment.name,
				url: attachment.url,
				type: attachment.type,
				size: attachment.size,
				uploadedAt: attachment.uploadedAt,
				workPermitId: attachment.workPermitId,
				uploadedById: attachment.uploadedById,
			},
		})

		return {
			ok: true,
			message: "Archivo adjuntado exitosamente",
		}
	} catch (error) {
		console.error("[ADD_WORK_PERMIT_ATTACHMENT]", error)
		return {
			ok: false,
			message: "Error al adjuntar el archivo",
		}
	}
}
