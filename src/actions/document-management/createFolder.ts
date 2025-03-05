"use server"

import type { FolderFormSchema } from "@/lib/form-schemas/document-management/folder.schema"
import prisma from "@/lib/prisma"

export const createFolder = async (values: FolderFormSchema) => {
	try {
		const { parentId, userId, ...rest } = values

		let connections: {
			user: {
				connect: {
					id: string
				}
			}
			parent?: {
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

		if (parentId) {
			connections = {
				...connections,
				parent: {
					connect: {
						id: parentId,
					},
				},
			}
		}

		const folder = await prisma.folder.create({
			data: {
				...rest,
				...connections,
			},
		})

		return { ok: true, folder }
	} catch (error) {
		console.error("Error creating folder:", error)
		return { ok: false, message: "Error creating folder" }
	}
}
