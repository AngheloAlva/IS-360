import { type QueryFunction, useQuery } from "@tanstack/react-query"
import type { DocumentCategory } from "@prisma/client"

import { getCompanyEntities } from "../actions/get-company-entities"

interface UseCompanyEntitiesParams {
	companyId: string
	startupFolderId: string
	category: DocumentCategory
}

export const fetchCompanyEntities: QueryFunction<
	Awaited<ReturnType<typeof getCompanyEntities>>,
	readonly ["startupFolderDocuments", UseCompanyEntitiesParams]
> = async ({ queryKey }) => {
	const [, { startupFolderId, category, companyId }] = queryKey

	return getCompanyEntities({ startupFolderId, category, companyId })
}

export const useCompanyEntities = ({
	category,
	companyId,
	startupFolderId,
}: UseCompanyEntitiesParams) => {
	const queryKey = ["startupFolderDocuments", { startupFolderId, category, companyId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchCompanyEntities,
		enabled: !!category && !!companyId && !!startupFolderId,
	})
}
