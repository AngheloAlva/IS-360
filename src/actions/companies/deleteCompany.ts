"use server"

import prisma from "@/lib/prisma"

export const deleteCompany = async (companyId: string) => {
	try {
		await prisma.$transaction(async (tx) => {
			const startupFolders = await tx.startupFolder.findMany({
				where: {
					companyId,
				},
			})

			if (startupFolders.length > 0) {
				const safetyFolders = await tx.safetyAndHealthFolder.findMany({
					where: { startupFolderId: { in: startupFolders.map((folder) => folder.id) } },
				})
				const environmentalFolders = await tx.environmentalFolder.findMany({
					where: { startupFolderId: { in: startupFolders.map((folder) => folder.id) } },
				})
				const vehicleFolders = await tx.vehicleFolder.findMany({
					where: { startupFolderId: { in: startupFolders.map((folder) => folder.id) } },
				})
				const workerFolders = await tx.workerFolder.findMany({
					where: { startupFolderId: { in: startupFolders.map((folder) => folder.id) } },
				})

				await Promise.all([
					tx.safetyAndHealthDocument.deleteMany({
						where: {
							folderId: {
								in: safetyFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.environmentalDocument.deleteMany({
						where: {
							folderId: {
								in: environmentalFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.vehicleDocument.deleteMany({
						where: {
							folderId: {
								in: vehicleFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.workerDocument.deleteMany({
						where: {
							folderId: {
								in: workerFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.safetyAndHealthFolder.deleteMany({
						where: {
							startupFolderId: {
								in: startupFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.environmentalFolder.deleteMany({
						where: {
							startupFolderId: {
								in: startupFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.vehicleFolder.deleteMany({
						where: {
							startupFolderId: {
								in: startupFolders.map((folder) => folder.id),
							},
						},
					}),
					tx.workerFolder.deleteMany({
						where: {
							startupFolderId: {
								in: startupFolders.map((folder) => folder.id),
							},
						},
					}),
				])

				await tx.startupFolder.deleteMany({
					where: {
						companyId,
					},
				})
			}

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
