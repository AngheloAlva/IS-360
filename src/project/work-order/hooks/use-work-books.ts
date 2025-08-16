import { type QueryFunction, useQuery } from "@tanstack/react-query"

export interface WorkBook {
	id: string
	otNumber: string
	workBookName: string | null
	workBookLocation: string | null
	workBookStartDate: string | null
	progress: number | null
	status: string
	solicitationDate: string
	equipment: {
		id: string
		name: string
	}[]
	company?: {
		id: string
		name: string
		logo: string | null
	}
	supervisor: {
		id: string
		name: string
		email: string
		role: string
	}
	responsible: {
		id: string
		name: string
		email: string
		role: string
	}
	_count: {
		workBookEntries: number
	}
}

export interface WorkBooksResponse {
	workBooks: WorkBook[]
	total: number
	pages: number
}

export interface UseWorkBooksParams {
	page?: number
	limit?: number
	search?: string
}

export const fetchWorkBooks: QueryFunction<
	WorkBooksResponse,
	readonly ["workBooks", { page: number; limit: number; search: string }]
> = async ({ queryKey }) => {
	const [, { page, limit, search }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/work-book?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work books")

	return res.json()
}

export const useWorkBooks = ({ page = 1, limit = 10, search = "" }: UseWorkBooksParams = {}) => {
	const queryKey = ["workBooks", { page, limit, search }] as const

	return useQuery({
		queryKey,
		queryFn: fetchWorkBooks,
	})
}
