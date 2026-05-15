"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { UpdateExpirationDateSchema } from "@/project/startup-folder/schemas/update-expiration-date"

export const updateEnvironmentalDocumentExpirationDate = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
}) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		const isInternalMember = session?.user?.accessRole === "ADMIN"

		const existingDocument = await prisma.environmentalDocument.findUnique({
			where: {
				id: documentId,
			},
			include: {
				folder: {
					select: {
						status: true,
					},
				},
			},
		})

		if (!existingDocument) {
			return { ok: false, message: "Documento no encontrado" }
		}

		if (existingDocument.folder.status !== "DRAFT" && !isInternalMember) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		const updatedDocument = await prisma.environmentalDocument.update({
			where: {
				id: documentId,
			},
			data: {
				expirationDate,
			},
		})

		return { ok: true, data: updatedDocument }
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
