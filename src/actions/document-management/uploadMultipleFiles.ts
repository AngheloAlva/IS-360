"use server"

import { FileFormSchema } from "@/lib/form-schemas/document-management/file.schema"
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
		const { folderSlug, userId, code, otherCode, area, name, description, registrationDate, expirationDate } = values

		// Buscar la carpeta si se proporciona un folderSlug
		let folderId: string | null = null
		if (folderSlug) {
			const foundFolder = await prisma.folder.findFirst({
				where: { slug: folderSlug },
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
						url: file.url,
						type: file.type,
						size: file.size,
						name: name || file.name,
						area: area as AREAS,
						description,
						registrationDate,
						expirationDate,
						user: { connect: { id: userId } },
						code: code || otherCode,
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
