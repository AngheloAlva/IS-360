"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			success: false,
			message: "No autorizado",
		}
	}

	try {
		const file = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				id: true,
				name: true,
				type: true,
				size: true,
				folderId: true,
			},
		})
		if (!file) return { success: false, message: "Archivo no encontrado" }

		const updatedFile = await prisma.file.update({
			where: { id: fileId },
			data: { isActive: false, name: "(Eliminado) " + file.name },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.DELETE,
			entityId: updatedFile.id,
			entityType: "File",
			metadata: {
				name: file.name,
				type: file.type,
				size: file.size,
				folderId: file.folderId,
			},
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			success: false,
			message: "No autorizado",
		}
	}

	try {
		const contents = await getRecursiveFolderContents(folderId)

		const folder = await prisma.folder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				name: true,
				slug: true,
				area: true,
				parentId: true,
			},
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
			await Promise.all(
				files.map((file) =>
					prisma.file.update({
						where: { id: file.id },
						data: {
							isActive: false,
							name: "(Eliminado) " + file.name,
						},
					})
				)
			)
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

		logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.DELETE,
			entityId: folder.id,
			entityType: "Folder",
			metadata: {
				name: folder.name,
				slug: folder.slug,
				area: folder.area,
				parentId: folder.parentId,
				affectedFiles: contents.files.length,
				affectedFolders: contents.folders.length - 1, // -1 para no contar la carpeta actual
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
