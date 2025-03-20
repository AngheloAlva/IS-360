"use server"

import prisma from "@/lib/prisma"

import type { FolderFormSchema } from "@/lib/form-schemas/document-management/folder.schema"

interface UpdateFolderProps {
	id: string
	values: FolderFormSchema
}

export const updateFolder = async ({ id, values }: UpdateFolderProps) => {
	try {
		const updatedFolder = await prisma.folder.update({
			where: {
				id,
			},
			data: values,
		})

		return { ok: true, data: updatedFolder }
	} catch (error) {
		console.error("Error updating folder:", error)
		return { ok: false, message: "Error updating folder" }
	}
}
