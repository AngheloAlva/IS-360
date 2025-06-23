"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, AREAS, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { FileFormSchema } from "@/project/document/schemas/new-file.schema"

type FileUploadResult = {
	url: string
	size: number
	type: string
	name: string
}

interface UploadMultipleFilesProps {
	values: Omit<FileFormSchema, "files"> & { files: undefined }
	files: FileUploadResult[]
}

export async function uploadMultipleFiles({ values, files }: UploadMultipleFilesProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			error: "No autorizado",
		}
	}

	try {
		const {
			area,
			name,
			code,
			userId,
			otherCode,
			description,
			expirationDate,
			parentFolderId,
			registrationDate,
		} = values

		let folderId: string | null = null
		if (parentFolderId) {
			const foundFolder = await prisma.folder.findFirst({
				where: { id: parentFolderId },
				select: { id: true, userId: true },
			})

			if (!foundFolder) {
				return { ok: false, error: "Carpeta no encontrada" }
			}

			folderId = foundFolder.id
		}

		const results = await Promise.all(
			files.map(async (file) => {
				const createdFile = await prisma.file.create({
					data: {
						description,
						url: file.url,
						expirationDate,
						type: file.type,
						size: file.size,
						registrationDate,
						area: area as AREAS,
						name: name || file.name,
						code: code || otherCode,
						user: { connect: { id: userId } },
						...(folderId ? { folder: { connect: { id: folderId } } } : {}),
					},
				})

				logActivity({
					userId: session.user.id,
					module: MODULES.DOCUMENTATION,
					action: ACTIVITY_TYPE.CREATE,
					entityId: createdFile.id,
					entityType: "File",
					metadata: {
						name: createdFile.name,
						type: createdFile.type,
						size: createdFile.size,
						code: createdFile.code,
						area: createdFile.area,
						description: createdFile.description,
						folderId: createdFile.folderId,
						expirationDate: createdFile.expirationDate?.toISOString(),
						registrationDate: createdFile.registrationDate?.toISOString(),
					},
				})

				return createdFile
			})
		)

		return { ok: true, data: results }
	} catch (error: unknown) {
		console.error("[UPLOAD_MULTIPLE_FILES]", error)
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Error interno del servidor",
		}
	}
}
