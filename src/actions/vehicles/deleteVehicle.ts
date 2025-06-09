"use server"

import prisma from "@/lib/prisma"

interface DeleteVehicleProps {
	vehicleId: string
	companyId: string
}

export const deleteVehicle = async ({ vehicleId, companyId }: DeleteVehicleProps) => {
	try {
		// Verificar que el vehículo pertenezca a la empresa del usuario
		const vehicle = await prisma.vehicle.findFirst({
			where: {
				id: vehicleId,
				companyId,
			},
		})

		if (!vehicle) {
			return {
				ok: false,
				message: "Vehículo no encontrado o no tienes permisos para eliminarlo",
			}
		}

		// Primero eliminar documentos y carpetas relacionadas
		await prisma.$transaction(async (tx) => {
			// Buscar todas las carpetas de vehículos asociadas
			const vehicleFolders = await tx.vehicleFolder.findMany({
				where: {
					vehicleId,
				},
				select: {
					id: true,
				},
			})

			// Eliminar documentos de vehículos en esas carpetas
			if (vehicleFolders.length > 0) {
				await tx.vehicleDocument.deleteMany({
					where: {
						folderId: {
							in: vehicleFolders.map((folder) => folder.id),
						},
					},
				})
			}

			// Eliminar carpetas de vehículos
			await tx.vehicleFolder.deleteMany({
				where: {
					vehicleId,
				},
			})

			// Finalmente eliminar el vehículo
			await tx.vehicle.update({
				where: {
					id: vehicleId,
				},
				data: {
					isActive: false,
				},
			})
		})

		return {
			ok: true,
			message: "Vehículo eliminado exitosamente",
		}
	} catch (error) {
		console.error("Error al eliminar vehículo:", error)
		return {
			ok: false,
			message: "Error al eliminar vehículo",
		}
	}
}
