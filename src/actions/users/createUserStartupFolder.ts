"use server"

import { WORKER_STRUCTURE } from "@/lib/consts/startup-folders-structure"
import prisma from "@/lib/prisma"

import type { WorkerDocumentType } from "@prisma/client"

export const createUserStartupFolder = async (userId: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!user || !user.companyId) {
			return {
				ok: false,
				message: "Usuario no encontrado",
			}
		}

		const startupFolders = await prisma.startupFolder.findMany({
			where: {
				companyId: user.companyId,
			},
			select: {
				id: true,
			},
		})

		if (!startupFolders.length) {
			return {
				ok: false,
				message: "No se encontró la carpeta inicial",
			}
		}

		await Promise.all(
			startupFolders.map((folder) =>
				prisma.workerFolder.create({
					data: {
						worker: {
							connect: {
								id: userId,
							},
						},
						startupFolder: {
							connect: {
								id: folder.id,
							},
						},
						documents: {
							create: WORKER_STRUCTURE.documents.map((doc) => ({
								url: "",
								name: doc.name,
								category: WORKER_STRUCTURE.category,
								type: doc.type as WorkerDocumentType,
							})),
						},
					},
				})
			)
		)

		return {
			ok: true,
			message: "Carpeta inicial creada exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_USER_STARTUP_FOLDER]", error)
		return {
			ok: false,
			message: "Error al crear la carpeta inicial",
		}
	}
}
