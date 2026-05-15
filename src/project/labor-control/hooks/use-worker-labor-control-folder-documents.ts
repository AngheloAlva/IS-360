import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getWorkerFolderDocuments } from "../actions/worker/get-worker-folder-documents"

interface UseWorkerFolderDocumentsParams {
	folderId: string
}

export const fetchWorkerLaborControlFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getWorkerFolderDocuments>>,
	readonly ["workerLaborControlFolderDocuments", UseWorkerFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { folderId }] = queryKey

	return getWorkerFolderDocuments({ folderId })
}

export const useWorkerLaborControlFolderDocuments = ({
	folderId,
}: UseWorkerFolderDocumentsParams) => {
	const queryKey = ["workerLaborControlFolderDocuments", { folderId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchWorkerLaborControlFolderDocuments,
	})
}
