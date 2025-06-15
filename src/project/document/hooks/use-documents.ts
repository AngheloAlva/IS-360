import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Folder as FolderType, File as FileType, AREAS, FileComment } from "@prisma/client"

export interface Folder extends FolderType {
	user: {
		name: string
	}
	_count: {
		files: number
		subFolders: number
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
	order: "asc" | "desc"
	orderBy: "name" | "createdAt"
}

export const useDocuments = ({ area, folderId, order, orderBy }: UseDocumentsParams) => {
	return useQuery<DocumentsResponse>({
		queryKey: ["documents", { area, folderId, order, orderBy }],
		queryFn: (fn) =>
			fetchDocuments({ ...fn, queryKey: ["documents", { area, folderId, order, orderBy }] }),
	})
}

export const fetchDocuments: QueryFunction<
	DocumentsResponse,
	[
		"documents",
		{ area: AREAS; folderId: string | null; order: "asc" | "desc"; orderBy: "name" | "createdAt" },
	]
> = async ({ queryKey }) => {
	const [, { area, folderId, order, orderBy }]: [
		string,
		{ area: AREAS; folderId: string | null; order: "asc" | "desc"; orderBy: "name" | "createdAt" },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("area", area.toString())
	if (folderId) searchParams.set("folderId", folderId)
	searchParams.set("order", order)
	searchParams.set("orderBy", orderBy)

	const res = await fetch(`/api/documents?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching documents")

	return res.json()
}
