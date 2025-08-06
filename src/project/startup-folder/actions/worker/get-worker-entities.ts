"use server"

import { ReviewStatus, USER_ROLE } from "@prisma/client"
import prisma from "@/lib/prisma"

interface GetCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
}

interface SelectedEntity {
	id: string
	rut: string
	name: string
	status: ReviewStatus
}

export const getWorkerEntities = async ({
	companyId,
	startupFolderId,
}: GetCompanyEntitiesParams): Promise<{
	allEntities: SelectedEntity[]
	vinculatedEntities: SelectedEntity[]
}> => {
	try {
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
								rut: true,
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
				rut: true,
			},
			orderBy: {
				name: "asc",
			},
		})

		return {
			allEntities: allWorkerFolders.map((user) => ({
				id: user.id,
				rut: user.rut,
				name: user.name,
				status: ReviewStatus.DRAFT,
			})),
			vinculatedEntities:
				vinculatedUsers?.workersFolders.map((workerFolder) => ({
					id: workerFolder.worker.id,
					status: workerFolder.status,
					rut: workerFolder.worker.rut,
					name: workerFolder.worker.name,
				})) ?? [],
		}
	} catch (error) {
		console.error("Error fetching worker entities:", error)
		throw new Error("Error fetching worker entities")
	}
}
