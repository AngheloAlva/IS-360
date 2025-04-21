import { useQuery } from "@tanstack/react-query"

import type { FileComment } from "@prisma/client"

interface UseFileCommentsResponse {
	comments: Array<FileComment & { user: { name: string } }>
}

interface UseFileCommentsParams {
	fileId: string
}

export const useFileComments = ({ fileId }: UseFileCommentsParams) => {
	return useQuery<UseFileCommentsResponse>({
		queryKey: ["documents", { fileId }],
		queryFn: async () => {
			const res = await fetch(`/api/documents/file/${fileId}/comments`)
			if (!res.ok) throw new Error("Error fetching documents")

			return res.json()
		},
		staleTime: 0,
		gcTime: 1000 * 60 * 5,
	})
}
