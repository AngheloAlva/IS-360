"use server"

import prisma from "@/lib/prisma"

import { z } from "zod"

import type { WorkerDocumentType } from "@prisma/client"

const createWorkerDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	workerId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
	expirationDate: z.date(),
	startupFolderId: z.string(),
})

export type CreateWorkerDocumentInput = z.infer<typeof createWorkerDocumentSchema>

export async function createWorkerDocument(input: CreateWorkerDocumentInput) {
	try {
		const { userId, workerId, documentType, documentName, url, expirationDate, startupFolderId } =
			createWorkerDocumentSchema.parse(input)

		const workerFolder = await prisma.workerFolder.findUnique({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
			select: {
				id: true,
				worker: {
					select: {
						id: true,
						companyId: true,
					},
				},
			},
		})

		if (!workerFolder) {
			throw new Error("Carpeta de personal no encontrada")
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (!user || user.companyId !== workerFolder.worker.companyId) {
			throw new Error("No autorizado - El usuario no pertenece a la empresa")
		}

		await prisma.workerDocument.create({
			data: {
				url,
				expirationDate,
				name: documentName,
				category: "PERSONNEL",
				uploadedById: userId,
				folderId: workerFolder.id,
				type: documentType as WorkerDocumentType,
			},
		})

		return {
			ok: true,
			message: "Documento de personal subido correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Ocurrio un error subiendo el documento",
		}
	}
}
