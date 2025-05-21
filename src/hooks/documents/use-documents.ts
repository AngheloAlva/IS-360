import { QueryFunction, useQuery } from "@tanstack/react-query"

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
	return useQuery<DocumentsResponse>({
		queryKey: ["documents", { area, folderId }],
		queryFn: (fn) => fetchDocuments({ ...fn, queryKey: ["documents", { area, folderId }] }),
	})
}

export const fetchDocuments: QueryFunction<
	DocumentsResponse,
	["documents", { area: AREAS; folderId: string | null }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { area, folderId }]: [string, { area: AREAS; folderId: string | null }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("area", area.toString())
	if (folderId) searchParams.set("folderId", folderId)

	const res = await fetch(`/api/documents?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching documents")

	return res.json()
}
