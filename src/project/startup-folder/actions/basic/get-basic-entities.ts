"use server"

import { ReviewStatus, ACCESS_ROLE } from "@prisma/client"
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
							accessRole: ACCESS_ROLE.PARTNER_COMPANY,
						},
					},
					select: {
						status: true,
						worker: {
							select: {
								id: true,
								rut: true,
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
				accessRole: ACCESS_ROLE.PARTNER_COMPANY,
				NOT: {
					id: {
						in: vinculatedBasicUsers?.basicFolders.map((wf) => wf.worker?.id),
					},
				},
			},
			select: {
				id: true,
				rut: true,
				name: true,
			},
			orderBy: {
				name: "asc",
			},
		})

		return {
			allEntities: allBasicFolders.map((user) => ({
				id: user.id,
				rut: user.rut,
				name: user.name,
				status: ReviewStatus.DRAFT,
			})),
			vinculatedEntities:
				vinculatedBasicUsers?.basicFolders?.map((basicFolder) => ({
					status: basicFolder.status,
					id: basicFolder.worker?.id,
					rut: basicFolder.worker.rut,
					name: basicFolder.worker?.name,
				})) ?? [],
		}
	} catch (error) {
		console.error("Error fetching basic entities:", error)
		throw new Error("No se pudieron cargar las entidades basicas")
	}
}
