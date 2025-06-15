"use server"

import prisma from "@/lib/prisma"

export const deleteCompany = async (companyId: string) => {
	try {
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
