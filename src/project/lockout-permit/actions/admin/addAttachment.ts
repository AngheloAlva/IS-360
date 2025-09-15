"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { UploadResult } from "@/lib/upload-files"

interface AddLockoutPermitAttachmentProps {
	userId: string
	companyId: string
	lockoutPermitId: string
}

export const addLockoutPermitAttachment = async (
	values: AddLockoutPermitAttachmentProps,
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

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				lockoutPermit: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permisos para agregar archivos",
		}
	}

	try {
		const { userId, lockoutPermitId } = values

		const attachment = await prisma.lockoutPermitAttachment.create({
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
				lockoutPermit: {
					connect: {
						id: lockoutPermitId,
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
				lockoutPermitId: true,
				uploadedById: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: attachment.id,
			entityType: "LockoutPermitAttachment",
			metadata: {
				name: attachment.name,
				url: attachment.url,
				type: attachment.type,
				size: attachment.size,
				uploadedAt: attachment.uploadedAt,
				lockoutPermitId: attachment.lockoutPermitId,
				uploadedById: attachment.uploadedById,
			},
		})

		return {
			ok: true,
			message: "Archivo adjuntado exitosamente",
		}
	} catch (error) {
		console.error("[ADD_LOCKOUT_PERMIT_ATTACHMENT]", error)
		return {
			ok: false,
			message: "Error al adjuntar el archivo",
		}
	}
}
