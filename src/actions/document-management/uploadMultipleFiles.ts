"use server"

import prisma from "@/lib/prisma"

import type { FileFormSchema } from "@/lib/form-schemas/document-management/file.schema"

export const uploadMultipleFiles = async (data: FileFormSchema) => {
	try {
		const { folderSlug, userId, files, ...rest } = data
		let folderId: string | null = null

		if (folderSlug) {
			const foundFolder = await prisma.folder.findFirst({
				where: { slug: folderSlug },
				select: { id: true },
			})

			if (!foundFolder) {
				return {
					ok: false,
					error: "Carpeta no encontrada",
				}
			}

			folderId = foundFolder.id
		}

		let relations: {
			folder?: { connect: { id: string } }
			user: { connect: { id: string } }
		} = {
			user: { connect: { id: userId } },
		}

		if (folderSlug && folderId !== null) {
			relations = {
				...relations,
				folder: { connect: { id: folderId } },
			}
		}

		const results = await prisma.file.createMany({
			data: files.map((fileData) => ({
				...rest,
				userId,
				area: rest.area,
				url: fileData.url,
				name: fileData.title,
				size: fileData.fileSize,
				type: fileData.mimeType,
				...relations,
			})),
		})

		return {
			ok: true,
			data: results,
		}
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			error: (error as Error).message,
		}
	}
}
