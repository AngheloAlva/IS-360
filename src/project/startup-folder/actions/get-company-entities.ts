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
						workerFolders: {
							where: {
								worker: {
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
						NOT: {
							startupFolders: {
								some: {
									id: startupFolderId,
								},
							},
						},
						worker: {
							isActive: true,
							accessRole: USER_ROLE.PARTNER_COMPANY,
							companyId,
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
						vinculatedUsers?.workerFolders.map((workerFolder) => ({
							id: workerFolder.worker.id,
							name: workerFolder.worker.name,
						})) ?? [],
				}
			case "VEHICLES":
				const vinculatedVehicles = await prisma.vehicle
					.findMany({
						where: {
							companyId,
							isActive: true,
						},
						select: {
							id: true,
							plate: true,
							brand: true,
							model: true,
						},
						orderBy: {
							plate: "asc",
						},
					})
					.then((vehicles) =>
						vehicles.map((vehicle) => ({
							id: vehicle.id,
							name: `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} - ${vehicle?.plate ?? ""}`.trim(),
						}))
					)

				const allVehicles = await prisma.vehicle
					.findMany({
						where: {
							companyId,
							isActive: true,
						},
						select: {
							id: true,
							plate: true,
							brand: true,
							model: true,
						},
						orderBy: {
							plate: "asc",
						},
					})
					.then((vehicles) =>
						vehicles.map((vehicle) => ({
							id: vehicle.id,
							name: `${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} - ${vehicle?.plate ?? ""}`.trim(),
						}))
					)

				return {
					allEntities: allVehicles,
					vinculatedEntities: vinculatedVehicles,
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
