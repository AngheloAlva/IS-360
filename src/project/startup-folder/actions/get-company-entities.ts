"use server"

import { DocumentCategory, ReviewStatus, USER_ROLE } from "@prisma/client"
import prisma from "@/lib/prisma"

interface GetCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
	category: DocumentCategory
}

interface SelectedEntity {
	id: string
	name: string
	status: ReviewStatus
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
			case "BASIC":
				const vinculatedBasicUsers = await prisma.startupFolder.findUnique({
					where: {
						id: startupFolderId,
					},
					select: {
						id: true,
						name: true,
						basicFolders: {
							where: {
								worker: {
									companyId,
									isActive: true,
									accessRole: USER_ROLE.PARTNER_COMPANY,
								},
							},
							select: {
								status: true,
								worker: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
				})

				const allBasicFolders = await prisma.user.findMany({
					where: {
						companyId,
						isActive: true,
						accessRole: USER_ROLE.PARTNER_COMPANY,
						NOT: {
							id: {
								in: vinculatedBasicUsers?.basicFolders.map((wf) => wf.worker?.id),
							},
						},
					},
					select: {
						id: true,
						name: true,
					},
					orderBy: {
						name: "asc",
					},
				})

				return {
					allEntities: allBasicFolders.map((user) => ({
						id: user.id,
						name: user.name,
						status: ReviewStatus.DRAFT,
					})),
					vinculatedEntities:
						vinculatedBasicUsers?.basicFolders?.map((basicFolder) => ({
							id: basicFolder.worker?.id,
							status: basicFolder.status,
							name: basicFolder.worker?.name,
						})) ?? [],
				}
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
								status: true,
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

				const allWorkerFolders = await prisma.user.findMany({
					where: {
						companyId,
						isActive: true,
						accessRole: USER_ROLE.PARTNER_COMPANY,
						NOT: {
							id: {
								in: vinculatedUsers?.workersFolders.map((wf) => wf.worker.id),
							},
						},
					},
					select: {
						id: true,
						name: true,
					},
					orderBy: {
						name: "asc",
					},
				})

				return {
					allEntities: allWorkerFolders.map((user) => ({
						id: user.id,
						name: user.name,
						status: ReviewStatus.DRAFT,
					})),
					vinculatedEntities:
						vinculatedUsers?.workersFolders.map((workerFolder) => ({
							id: workerFolder.worker.id,
							status: workerFolder.status,
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
								status: true,
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

				const allVehiclesFolders = await prisma.vehicle.findMany({
					where: {
						companyId,
						isActive: true,
						NOT: {
							id: {
								in: vinculatedVehicles?.vehiclesFolders.map((vf) => vf.vehicle.id),
							},
						},
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

				return {
					allEntities: allVehiclesFolders.map((vehicle) => ({
						id: vehicle.id,
						name: vehicle.plate + " " + vehicle.brand + " " + vehicle.model,
						status: ReviewStatus.DRAFT,
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
							status: vehicleFolder.status,
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
