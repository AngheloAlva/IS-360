import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getCompanyAcreditacionFolderDocuments } from "../actions/get-company-acreditation-folder-documents"
import { getWorkersAcreditacionFolders } from "../actions/get-workers-acreditation-folders"

interface UseLaborControlFolderDocumentsParams {
	folderId: string
	companyId: string
}

export const fetchCompanyAcreditacionFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getCompanyAcreditacionFolderDocuments>>,
	readonly ["companyAccreditationFolderDocuments", UseLaborControlFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { folderId }] = queryKey

	return getCompanyAcreditacionFolderDocuments({ folderId })
}

export const fetchWorkersAcreditacionFolders: QueryFunction<
	Awaited<ReturnType<typeof getWorkersAcreditacionFolders>>,
	readonly ["workersAccreditationFolders", UseLaborControlFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { folderId }] = queryKey

	return getWorkersAcreditacionFolders({ folderId })
}

export const useCompanyAcreditacionFolderDocuments = ({
	folderId,
	companyId,
}: UseLaborControlFolderDocumentsParams) => {
	const queryKey = ["companyAccreditationFolderDocuments", { folderId, companyId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchCompanyAcreditacionFolderDocuments,
		enabled: !!folderId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		placeholderData: (previousData) => previousData,
	})
}

export const useWorkersAcreditacionFolders = ({
	folderId,
	companyId,
}: UseLaborControlFolderDocumentsParams) => {
	const queryKey = ["workersAccreditationFolders", { folderId, companyId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchWorkersAcreditacionFolders,
		enabled: !!folderId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		placeholderData: (previousData) => previousData,
	})
}
