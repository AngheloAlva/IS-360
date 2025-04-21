import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Folder as FolderType, File as FileType, AREAS } from "@prisma/client"

export interface Folder extends FolderType {
	user: {
		name: string
	}
}

export interface File extends FileType {
	user: {
		name: string
	}
}

interface DocumentsResponse {
	files: File[]
	folders: Folder[]
}

interface UseDocumentsParams {
	area: AREAS
	folderSlug: string | null
}

export const useDocuments = ({ area, folderSlug }: UseDocumentsParams) => {
	const queryClient = useQueryClient()

	const query = useQuery<DocumentsResponse>({
		queryKey: ["documents", { area, folderSlug }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("area", area.toString())
			if (folderSlug) searchParams.set("folderSlug", folderSlug)

			const res = await fetch(`/api/documents?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching documents")

			return res.json()
		},
		staleTime: 0,
		gcTime: 1000 * 60 * 5,
	})

	const invalidateDocuments = () => {
		return queryClient.invalidateQueries({ queryKey: ["documents", { area, folderSlug }] })
	}

	return {
		...query,
		invalidateDocuments,
	}
}
