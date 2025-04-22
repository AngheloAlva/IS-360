import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Folder as FolderType, File as FileType, AREAS, FileComment } from "@prisma/client"

export interface Folder extends FolderType {
	user: {
		name: string
	}
	_count: {
		files: number
	}
}

export interface File extends FileType {
	user: {
		name: string
	}
	comments: Array<FileComment & { user: { name: string } }>
}

interface DocumentsResponse {
	files: File[]
	folders: Folder[]
}

interface UseDocumentsParams {
	area: AREAS
	folderId: string | null
}

export const useDocuments = ({ area, folderId }: UseDocumentsParams) => {
	const queryClient = useQueryClient()

	const query = useQuery<DocumentsResponse>({
		queryKey: ["documents", { area, folderId }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("area", area.toString())
			if (folderId) searchParams.set("folderId", folderId)

			const res = await fetch(`/api/documents?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching documents")

			return res.json()
		},
		staleTime: 0,
		gcTime: 1000 * 60 * 5,
	})

	const invalidateDocuments = () => {
		return queryClient.invalidateQueries({ queryKey: ["documents", { area, folderId }] })
	}

	return {
		...query,
		invalidateDocuments,
	}
}
