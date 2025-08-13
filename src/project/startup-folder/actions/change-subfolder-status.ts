"use server"

import { headers } from "next/headers"

import { changeSubfolderStatusSchema } from "../schemas/change-subfolder-status.schema"
import { MODULES, USER_ROLE } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function changeSubfolderStatus(
	formData: FormData | { [key: string]: string | FormDataEntryValue }
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (session?.user?.accessRole !== USER_ROLE.ADMIN) {
		throw new Error("No tienes permisos para realizar esta acción")
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				startupFolder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		throw new Error("No tienes permisos para realizar esta acción")
	}

	const rawFormData =
		formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

	const validatedData = changeSubfolderStatusSchema.safeParse(rawFormData)

	if (!validatedData.success) {
		throw new Error("Datos inválidos")
	}

	const { startupFolderId, subfolderType, newStatus, entityId, reason } = validatedData.data

	try {
		switch (subfolderType) {
			case "SAFETY_AND_HEALTH":
				await prisma.safetyAndHealthFolder.update({
					where: { startupFolderId },
					data: { status: newStatus },
				})
				break

			case "ENVIRONMENTAL":
				await prisma.environmentalFolder.update({
					where: { startupFolderId },
					data: { status: newStatus },
				})
				break

			case "ENVIRONMENT":
				await prisma.environmentFolder.update({
					where: { startupFolderId },
					data: { status: newStatus },
				})
				break

			case "TECHNICAL_SPECS":
				await prisma.techSpecsFolder.update({
					where: { startupFolderId },
					data: { status: newStatus },
				})
				break

			case "WORKER":
				if (!entityId) {
					throw new Error("ID del trabajador requerido")
				}
				await prisma.workerFolder.update({
					where: { workerId_startupFolderId: { workerId: entityId, startupFolderId } },
					data: { status: newStatus },
				})
				break

			case "VEHICLE":
				if (!entityId) {
					throw new Error("ID del vehículo requerido")
				}
				await prisma.vehicleFolder.update({
					where: { vehicleId_startupFolderId: { vehicleId: entityId, startupFolderId } },
					data: { status: newStatus },
				})
				break

			case "BASIC":
				if (!entityId) {
					throw new Error("ID del trabajador requerido")
				}
				await prisma.basicFolder.update({
					where: { workerId_startupFolderId: { workerId: entityId, startupFolderId } },
					data: { status: newStatus },
				})
				break

			default:
				throw new Error("Tipo de subcarpeta no válido")
		}

		const startupFolder = await prisma.startupFolder.findUnique({
			where: { id: startupFolderId },
			include: { company: { select: { name: true } } },
		})

		if (startupFolder) {
			await logActivity({
				action: "UPDATE",
				module: MODULES.STARTUP_FOLDERS,
				userId: session.user.id,
				entityType: "Subfolder",
				entityId: startupFolder.id,
				metadata: {
					startupFolderId,
					subfolderType,
					newStatus,
					entityId,
					reason,
					companyName: startupFolder.company.name,
				},
			})
		}

		return {
			ok: true,
			message: "Estado actualizado exitosamente",
		}
	} catch (error) {
		console.error("Error changing subfolder status:", error)
		throw new Error("Error al actualizar el estado de la subcarpeta")
	}
}
