import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getLaborControlFolderDocuments } from "../actions/get-labor-control-folder-documents"

interface UseLaborControlFolderDocumentsParams {
	folderId: string
	companyId: string
}

export const fetchLaborControlFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getLaborControlFolderDocuments>>,
	readonly ["laborControlFolderDocuments", UseLaborControlFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { folderId }] = queryKey

	return getLaborControlFolderDocuments({ folderId })
}

export const useLaborControlFolderDocuments = ({
	folderId,
	companyId,
}: UseLaborControlFolderDocumentsParams) => {
	const queryKey = ["laborControlFolderDocuments", { folderId, companyId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchLaborControlFolderDocuments,
		enabled: !!folderId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		placeholderData: (previousData) => previousData,
	})
}
