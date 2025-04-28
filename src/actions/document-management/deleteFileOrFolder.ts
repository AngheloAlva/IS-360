"use server"

import prisma from "@/lib/prisma"

export interface DeleteResponse {
	success: boolean
	message: string
	deletedFiles?: number
	deletedFolders?: number
}

async function getRecursiveFolderContents(folderId: string) {
	const folder = await prisma.folder.findUnique({
		where: { id: folderId },
		include: {
			files: true,
			subFolders: true,
		},
	})

	if (!folder) return { files: [], folders: [] }

	let allFiles = [...folder.files]
	let allFolders = [folder]

	for (const subFolder of folder.subFolders) {
		const subContents = await getRecursiveFolderContents(subFolder.id)
		allFiles = [...allFiles, ...subContents.files]
		allFolders = [...allFolders, ...subContents.folders]
	}

	return { files: allFiles, folders: allFolders }
}

export async function deleteFile(fileId: string): Promise<DeleteResponse> {
	try {
		const file = await prisma.file.findUnique({
			where: { id: fileId },
		})
		if (!file) return { success: false, message: "Archivo no encontrado" }

		await prisma.file.update({
			where: { id: fileId },
			data: { isActive: false, name: "(Eliminado) " + file.name },
		})

		return {
			success: true,
			message: "Archivo marcado como eliminado exitosamente",
			deletedFiles: 1,
		}
	} catch (error) {
		console.error("Error al eliminar el archivo:", error)
		return {
			success: false,
			message: "Error al eliminar el archivo",
		}
	}
}

export async function deleteFolder(folderId: string): Promise<DeleteResponse> {
	try {
		const contents = await getRecursiveFolderContents(folderId)

		const folder = await prisma.folder.findUnique({
			where: { id: folderId },
		})
		if (!folder) return { success: false, message: "Carpeta no encontrada" }

		const files = await prisma.file.findMany({
			where: {
				id: {
					in: contents.files.map((file) => file.id),
				},
			},
		})

		if (files.length > 0) {
			files.forEach((file) => {
				prisma.file.update({
					where: { id: file.id },
					data: { isActive: false, name: "(Eliminado) " + file.name },
				})
			})
		}

		// Marcar todas las carpetas como inactivas
		await prisma.folder.updateMany({
			where: {
				id: {
					in: contents.folders.map((folder) => folder.id),
				},
			},
			data: {
				isActive: false,
				slug: "eliminado-" + folder.slug,
				name: "(Eliminado) " + folder.name,
			},
		})

		return {
			success: true,
			message: "Carpeta y contenido marcados como eliminados exitosamente",
			deletedFiles: contents.files.length,
			deletedFolders: contents.folders.length,
		}
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return {
			success: false,
			message: "Error al eliminar la carpeta",
		}
	}
}

export async function getDeletePreview(
	id: string,
	type: "file" | "folder"
): Promise<{
	files: Array<{ id: string; name: string }>
	folders: Array<{ id: string; name: string }>
}> {
	if (type === "file") {
		const file = await prisma.file.findUnique({
			where: { id },
			select: { id: true, name: true },
		})
		return {
			files: file ? [file] : [],
			folders: [],
		}
	}

	const contents = await getRecursiveFolderContents(id)
	return {
		files: contents.files.map((f) => ({ id: f.id, name: f.name })),
		folders: contents.folders.map((f) => ({ id: f.id, name: f.name })),
	}
}
