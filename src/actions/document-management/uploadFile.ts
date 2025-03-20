"use server"

import prisma from "@/lib/prisma"

import type { FileFormSchema } from "@/lib/form-schemas/document-management/file.schema"

export const uploadFile = async (
	data: FileFormSchema,
	fileUrl: string,
	fileSize: number,
	fileType: string
) => {
	try {
		const { folderSlug, userId, ...rest } = data
		let folderId: string | null = null

		if (folderSlug) {
			const foundFolder = await prisma.folder.findFirst({
				where: {
					slug: folderSlug,
				},
				select: {
					id: true,
				},
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
			folder?: {
				connect: {
					id: string
				}
			}
			user: {
				connect: {
					id: string
				}
			}
		} = {
			user: {
				connect: {
					id: userId,
				},
			},
		}

		if (folderSlug && folderId !== null) {
			relations = {
				...relations,
				folder: {
					connect: {
						id: folderId,
					},
				},
			}
		}

		const result = await prisma.file.create({
			data: {
				...rest,
				url: fileUrl,
				size: fileSize,
				type: fileType,
				...relations,
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
