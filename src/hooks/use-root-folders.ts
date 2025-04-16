import { useQuery } from "@tanstack/react-query"

export interface RootFolder {
	id: string
	name: string
	description: string | null
	createdAt: Date
	updatedAt: Date
	company: {
		id: string
		name: string
	}
}

interface UseRootFoldersParams {
	page?: number
	limit?: number
	search?: string
}

interface RootFoldersResponse {
	rootFolders: RootFolder[]
	total: number
	pages: number
}

export const useRootFolders = ({
	page = 1,
	limit = 10,
	search = "",
}: UseRootFoldersParams = {}) => {
	return useQuery<RootFoldersResponse>({
		queryKey: ["root-folders", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/root-folders?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching root folders")

			return res.json()
		},
	})
}
