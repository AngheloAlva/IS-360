import type { WORK_ORDER_PRIORITY, WORK_ORDER_STATUS, WORK_ORDER_TYPE } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

export interface WorkBookByCompany {
	id: string
	otNumber: string
	workName: string | null
	workLocation: string | null
	workStartDate: string | null
	workProgressStatus: number | null
	status: WORK_ORDER_STATUS
	solicitationDate: Date
	type: WORK_ORDER_TYPE
	priority: WORK_ORDER_PRIORITY
	workRequest: string
	programDate: Date
	estimatedDays: number
	estimatedHours: number
	workDescription: string
	equipment: {
		name: string
	}[]
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
	companyId,
	onlyBooks,
	limit = 10,
	search = "",
}: {
	page: number
	limit: number
	search: string
	companyId: string
	onlyBooks: boolean
}) => {
	return useQuery<WorkBooksResponse>({
		queryKey: ["workBooks", { page, limit, search, companyId, onlyBooks }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			searchParams.set("onlyBooks", onlyBooks.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/work-book/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching work books")

			return res.json()
		},
	})
}
