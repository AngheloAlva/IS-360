import { useQuery } from "@tanstack/react-query"

import { File as FileType } from "@prisma/client"

export interface File extends FileType {
	user: {
		name: string
	}
}

interface DocumentsResponse {
	files: File[]
}

interface UseDocumentsParams {
	page: number
	limit: number
	search: string
}

export const useSearchDocuments = ({ page, limit, search }: UseDocumentsParams) => {
	return useQuery<DocumentsResponse>({
		queryKey: ["documents", { search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("limit", limit.toString())
			searchParams.set("page", page.toString())
			searchParams.set("search", search)

			const res = await fetch(`/api/documents/search?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching documents")

			return res.json()
		},
		staleTime: 10,
		gcTime: 1000 * 60 * 5,
	})
}
