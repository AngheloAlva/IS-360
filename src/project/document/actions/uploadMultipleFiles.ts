"use server"

import { FileFormSchema } from "@/project/document/schemas/new-file.schema"
import prisma from "@/lib/prisma"
import { AREAS } from "@prisma/client"

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

		// Buscar la carpeta si se proporciona un folderSlug
		let folderId: string | null = null
		if (parentFolderId) {
			const foundFolder = await prisma.folder.findFirst({
				where: { id: parentFolderId },
				select: { id: true },
			})

			if (!foundFolder) {
				return { ok: false, error: "Carpeta no encontrada" }
			}

			folderId = foundFolder.id
		}

		// Crear registros en la base de datos
		const results = await Promise.all(
			files.map(async (file) => {
				return prisma.file.create({
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
