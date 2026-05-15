import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getWorkerFolderDocuments } from "../actions/worker/get-worker-folder-documents"

interface UseWorkerFolderDocumentsParams {
	workerId: string
	startupFolderId: string
}

export const fetchWorkerFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getWorkerFolderDocuments>>,
	readonly ["workerFolderDocuments", UseWorkerFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { startupFolderId, workerId }] = queryKey

	return getWorkerFolderDocuments({ startupFolderId, workerId })
}

export const useWorkerFolderDocuments = ({
	workerId,
	startupFolderId,
}: UseWorkerFolderDocumentsParams) => {
	const queryKey = ["workerFolderDocuments", { startupFolderId, workerId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchWorkerFolderDocuments,
		enabled: !!startupFolderId && !!workerId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		placeholderData: (previousData) => previousData,
	})
}
