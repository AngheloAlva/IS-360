import { useQuery } from "@tanstack/react-query"

export interface StarterBook {
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

interface UseStarterBooksParams {
	page?: number
	limit?: number
	search?: string
}

interface StarterBooksResponse {
	starterBooks: StarterBook[]
	total: number
	pages: number
}

export const useStarterBooks = ({
	page = 1,
	limit = 10,
	search = "",
}: UseStarterBooksParams = {}) => {
	return useQuery<StarterBooksResponse>({
		queryKey: ["starter-books", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/starter-book?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching starter books")

			return res.json()
		},
	})
}
