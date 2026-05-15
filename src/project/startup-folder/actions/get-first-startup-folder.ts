"use server"

import prisma from "@/lib/prisma"

interface GetFirstStartupFolderParams {
	companyId: string
	includeArchived?: boolean
	archivedOnly?: boolean
}

interface FirstStartupFolderResult {
	id: string
	isArchived: boolean
}

export async function getFirstStartupFolder({
	companyId,
	includeArchived = false,
	archivedOnly = false,
}: GetFirstStartupFolderParams): Promise<FirstStartupFolderResult | null> {
	return prisma.startupFolder.findFirst({
		where: {
			companyId,
			isDeleted: false,
			...(archivedOnly ? { isArchived: true } : includeArchived ? {} : { isArchived: false }),
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			isArchived: true,
		},
	})
}
