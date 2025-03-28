import { useQuery } from "@tanstack/react-query"

interface WorkBookStats {
	activeCount: number
	completedCount: number
	totalEntries: number
	avgProgress: number
}

export interface WorkBook {
	id: string
	otNumber: string
	workName: string | null
	workLocation: string | null
	workStartDate: string | null
	workProgressStatus: number | null
	status: string
	solicitationDate: string
	company: {
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
		workEntries: number
	}
}

interface WorkBooksResponse {
	workBooks: WorkBook[]
	total: number
	pages: number
	stats: WorkBookStats
}

export const useWorkBooks = ({ page = 1, limit = 10, search = "" }) => {
	return useQuery<WorkBooksResponse>({
		queryKey: ["workBooks", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/work-book?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching work books")

			return res.json()
		},
	})
}
