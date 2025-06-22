"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const deleteCompany = async (companyId: string) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				company: ["delete"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const company = await prisma.company.findUnique({
			where: { id: companyId },
			select: {
				id: true,
				name: true,
				rut: true,
				users: { select: { id: true } },
				vehicles: { select: { id: true } },
			},
		})

		if (!company) {
			return {
				ok: false,
				message: "Empresa no encontrada",
			}
		}

		await prisma.$transaction(async (tx) => {
			await tx.user.updateMany({
				where: {
					companyId,
				},
				data: {
					isActive: false,
				},
			})

			await tx.vehicle.updateMany({
				where: {
					companyId,
				},
				data: {
					isActive: false,
				},
			})

			await tx.company.update({
				where: { id: companyId },
				data: { isActive: false },
			})
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.DELETE,
			entityId: company.id,
			entityType: "Company",
			metadata: {
				name: company.name,
				rut: company.rut,
				affectedUsers: company.users.length,
				affectedVehicles: company.vehicles.length,
			},
		})

		return {
			ok: true,
			message: "Empresa eliminada correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al eliminar la empresa",
		}
	}
}
