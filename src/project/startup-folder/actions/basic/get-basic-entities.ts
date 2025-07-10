"use server"

import { ReviewStatus, USER_ROLE } from "@prisma/client"
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

export async function getBasicEntities({
	companyId,
	startupFolderId,
}: GetCompanyEntitiesParams): Promise<{
	allEntities: SelectedEntity[]
	vinculatedEntities: SelectedEntity[]
}> {
	try {
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
	} catch (error) {
		console.error("Error fetching basic entities:", error)
		throw new Error("No se pudieron cargar las entidades basicas")
	}
}
