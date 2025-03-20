"use server"

import prisma from "@/lib/prisma"

import type { Areas } from "@/lib/consts/areas"

export async function getFilesAndFolders(
	area: (typeof Areas)[keyof typeof Areas]["title"],
	folderSlug: string | null = null
) {
	try {
		const folders = await prisma.folder.findMany({
			where: {
				area,
				parent: folderSlug ? { slug: folderSlug } : null,
			},
			include: {
				files: true,
				subFolders: true,
				user: true,
			},
		})

		const files = await prisma.file.findMany({
			where: {
				folder: folderSlug ? { slug: folderSlug } : null,
			},
			include: {
				user: true,
			},
		})

		return {
			files,
			folders,
			ok: true,
		}
	} catch (error) {
		console.error("Error al obtener archivos y carpetas:", error)
		throw new Error("No se pudieron cargar los archivos y carpetas")
	}
}
