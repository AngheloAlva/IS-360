"use server"

import { DocumentCategory, USER_ROLE } from "@prisma/client"
import prisma from "@/lib/prisma"

interface GetCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
	category: DocumentCategory
}

interface SelectedEntity {
	id: string
	name: string
}

export async function getCompanyEntities({
	category,
	companyId,
	startupFolderId,
}: GetCompanyEntitiesParams): Promise<{
	allEntities: SelectedEntity[]
	vinculatedEntities: SelectedEntity[]
}> {
	try {
		switch (category) {
			case "PERSONNEL":
				const vinculatedUsers = await prisma.startupFolder.findUnique({
					where: {
						id: startupFolderId,
					},
					select: {
						id: true,
						name: true,
						workersFolders: {
							where: {
								worker: {
									companyId,
									isActive: true,
									accessRole: USER_ROLE.PARTNER_COMPANY,
								},
							},
							select: {
								worker: {
									select: {
										id: true,
										name: true,
									},
								},
							},
							orderBy: {
								worker: {
									name: "asc",
								},
							},
						},
					},
				})

				const allWorkerFolders = await prisma.workerFolder.findMany({
					where: {
						worker: {
							companyId,
							isActive: true,
							accessRole: USER_ROLE.PARTNER_COMPANY,
							NOT: {
								id: {
									in: vinculatedUsers?.workersFolders.map((wf) => wf.worker.id),
								},
							},
						},
					},
					select: {
						id: true,
						worker: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: {
						worker: {
							name: "asc",
						},
					},
				})

				return {
					allEntities: allWorkerFolders.map((user) => ({
						id: user.worker.id,
						name: user.worker.name,
					})),
					vinculatedEntities:
						vinculatedUsers?.workersFolders.map((workerFolder) => ({
							id: workerFolder.worker.id,
							name: workerFolder.worker.name,
						})) ?? [],
				}
			case "VEHICLES":
				const vinculatedVehicles = await prisma.startupFolder.findUnique({
					where: {
						id: startupFolderId,
					},
					select: {
						id: true,
						name: true,
						vehiclesFolders: {
							where: {
								vehicle: {
									companyId,
									isActive: true,
								},
							},
							select: {
								vehicle: {
									select: {
										id: true,
										plate: true,
										brand: true,
										model: true,
									},
								},
							},
							orderBy: {
								vehicle: {
									plate: "asc",
								},
							},
						},
					},
				})

				const allVehiclesFolders = await prisma.vehicleFolder.findMany({
					where: {
						vehicle: {
							companyId,
							isActive: true,
							NOT: {
								id: {
									in: vinculatedVehicles?.vehiclesFolders.map((vf) => vf.vehicle.id),
								},
							},
						},
					},
					select: {
						id: true,
						vehicle: {
							select: {
								id: true,
								plate: true,
								brand: true,
								model: true,
							},
						},
					},
					orderBy: {
						vehicle: {
							plate: "asc",
						},
					},
				})

				return {
					allEntities: allVehiclesFolders.map((vehicleFolder) => ({
						id: vehicleFolder.vehicle.id,
						name:
							vehicleFolder.vehicle.plate +
							" " +
							vehicleFolder.vehicle.brand +
							" " +
							vehicleFolder.vehicle.model,
					})),
					vinculatedEntities:
						vinculatedVehicles?.vehiclesFolders.map((vehicleFolder) => ({
							id: vehicleFolder.vehicle.id,
							name:
								vehicleFolder.vehicle.plate +
								" - " +
								vehicleFolder.vehicle.brand +
								" - " +
								vehicleFolder.vehicle.model,
						})) ?? [],
				}

			default:
				return {
					allEntities: [],
					vinculatedEntities: [],
				}
		}
	} catch (error) {
		console.error("Error fetching company entities:", error)
		throw new Error("No se pudieron cargar las entidades de la empresa")
	}
}
