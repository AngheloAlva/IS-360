import { type QueryFunction, useQuery } from "@tanstack/react-query"
import type { DocumentCategory } from "@prisma/client"

import { getStartupFolderDocuments } from "../actions/get-startup-folder-documents"

interface UseStartupFolderDocumentsParams {
	startupFolderId?: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}

export const fetchStartupFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getStartupFolderDocuments>>,
	readonly ["startupFolderDocuments", UseStartupFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { startupFolderId, category, workerId, vehicleId }] = queryKey
	return getStartupFolderDocuments({ startupFolderId, category, workerId, vehicleId })
}

export const useStartupFolderDocuments = ({
	startupFolderId,
	category,
	workerId,
	vehicleId,
}: UseStartupFolderDocumentsParams) => {
	const queryKey = [
		"startupFolderDocuments",
		{ startupFolderId, category, workerId, vehicleId },
	] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFolderDocuments,
		enabled: !!category && (!!startupFolderId || !!workerId || !!vehicleId),
	})
}
