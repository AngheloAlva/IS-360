"use server"

import prisma from "@/lib/prisma"

export const deleteUser = async (userId: string) => {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: { isActive: false },
		})

		return {
			ok: true,
			message: "Usuario eliminado correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al eliminar el usuario",
		}
	}
}

export const deleteExternalUser = async (workerId: string, companyId: string) => {
	try {
		const worker = await prisma.user.findUnique({
			where: {
				id: workerId,
				companyId,
			},
		})

		if (!worker) {
			return {
				ok: false,
				message: "Colaborador no encontrado o no tienes permisos para eliminarlo",
			}
		}

		await prisma.user.update({
			where: { id: workerId },
			data: { isActive: false },
		})

		return {
			ok: true,
			message: "Colaborador eliminado correctamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al eliminar el colaborador",
		}
	}
}
