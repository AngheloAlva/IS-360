"use server"

import { ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

interface GetCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
}

interface SelectedEntity {
	id: string
	name: string
	status: ReviewStatus
}

export const getVehicleEntities = async ({
	companyId,
	startupFolderId,
}: GetCompanyEntitiesParams): Promise<{
	allEntities: SelectedEntity[]
	vinculatedEntities: SelectedEntity[]
}> => {
	try {
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
	} catch (error) {
		console.error("Error fetching vehicle entities:", error)
		throw new Error("Error fetching vehicle entities")
	}
}
