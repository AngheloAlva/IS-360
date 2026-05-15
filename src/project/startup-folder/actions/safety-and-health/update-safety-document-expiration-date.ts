"use server"

import { headers } from "next/headers"

import { ACCESS_ROLE } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { UpdateExpirationDateSchema } from "@/project/startup-folder/schemas/update-expiration-date"

export const updateSafetyDocumentExpirationDate = async ({
	data: { documentId, expirationDate },
}: {
	data: UpdateExpirationDateSchema
}) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		const isOtcMember = session?.user?.accessRole === ACCESS_ROLE.ADMIN

		const existingDocument = await prisma.safetyAndHealthDocument.findUnique({
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

		if (existingDocument.folder.status !== "DRAFT" && !isOtcMember) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		const updatedDocument = await prisma.safetyAndHealthDocument.update({
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
