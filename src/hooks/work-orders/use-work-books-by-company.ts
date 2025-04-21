import { useQuery } from "@tanstack/react-query"

export interface WorkBookByCompany {
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
	workBooks: WorkBookByCompany[]
	total: number
	pages: number
}

export const useWorkBooksByCompany = ({
	page = 1,
	limit = 10,
	search = "",
	companyId,
}: {
	page: number
	limit: number
	search: string
	companyId: string
}) => {
	return useQuery<WorkBooksResponse>({
		queryKey: ["workBooks", { page, limit, search, companyId }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/work-book/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching work books")

			return res.json()
		},
	})
}
