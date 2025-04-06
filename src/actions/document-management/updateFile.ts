"use server"

import prisma from "@/lib/prisma"

import type { FileFormSchema } from "@/lib/form-schemas/document-management/file.schema"

interface UpdateFileParams extends FileFormSchema {
	fileId: string
	url: string
	size: number
	type: string
	previousUrl: string
	previousName: string
}

export const updateFile = async ({
	url,
	size,
	type,
	name,
	fileId,
	userId,
	description,
	previousUrl,
	previousName,
	expirationDate,
	registrationDate,
}: UpdateFileParams) => {
	try {
		// Obtener el archivo actual
		const currentFile = await prisma.file.findUnique({
			where: { id: fileId },
		})

		if (!currentFile) {
			return { ok: false, error: "Archivo no encontrado" }
		}

		const updatedFile = await prisma.file.update({
			where: { id: fileId },
			data: {
				url,
				size,
				type,
				name,
				description,
				expirationDate,
				registrationDate,
				revisionCount: { increment: 1 },
				user: {
					connect: {
						id: userId,
					},
				},
			},
		})

		await prisma.fileHistory.create({
			data: {
				file: {
					connect: {
						id: fileId,
					},
				},
				modifiedBy: {
					connect: {
						id: userId,
					},
				},
				previousUrl,
				previousName,
			},
		})

		return { ok: true, data: updatedFile }
	} catch (error) {
		console.error("[UPDATE_FILE]", error)
		return { ok: false, error: "Error al actualizar el archivo" }
	}
}
