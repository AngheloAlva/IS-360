import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getBasicFolderDocuments } from "../actions/basic/get-basic-folder-documents"

interface UseBasicFolderDocumentsParams {
	workerId: string
	startupFolderId: string
}

export const fetchBasicFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getBasicFolderDocuments>>,
	readonly ["basicFolderDocuments", UseBasicFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { startupFolderId, workerId }] = queryKey

	return getBasicFolderDocuments({ startupFolderId, workerId })
}

export const useBasicFolderDocuments = ({
	workerId,
	startupFolderId,
}: UseBasicFolderDocumentsParams) => {
	const queryKey = ["basicFolderDocuments", { startupFolderId, workerId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchBasicFolderDocuments,
	})
}
