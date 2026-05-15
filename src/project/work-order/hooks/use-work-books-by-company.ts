import type {
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
} from "@/generated/prisma/enums"
import { useQuery } from "@tanstack/react-query"

export const WORK_BOOK_SORT_BY = {
	CREATED_AT: "createdAt",
	OT_NUMBER: "otNumber",
	WORK_BOOK_NAME: "workBookName",
	WORK_BOOK_START_DATE: "workBookStartDate",
	ESTIMATED_END_DATE: "estimatedEndDate",
	STATUS: "status",
	PROGRESS: "progress",
	WORK_BOOK_LOCATION: "workBookLocation",
	TYPE: "type",
	SUPERVISOR_NAME: "supervisorName",
	RESPONSIBLE_NAME: "responsibleName",
} as const

export type WorkBookSortBy = (typeof WORK_BOOK_SORT_BY)[keyof typeof WORK_BOOK_SORT_BY]
export type WorkBookSortOrder = "asc" | "desc"

export interface WorkBookByCompany {
	id: string
	otNumber: string
	workBookName: string | null
	workBookLocation: string | null
	workBookStartDate: string | null
	progress: number | null
	status: WORK_ORDER_STATUS
	solicitationDate: Date
	type: WORK_ORDER_TYPE
	priority: WORK_ORDER_PRIORITY
	workRequest: string
	programDate: Date
	estimatedDays: number
	estimatedHours: number
	estimatedEndDate: Date | null
	rescheduledEndDate: Date | null
	workDescription: string
	equipments: {
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
	workBooks: WorkBookByCompany[]
	total: number
	pages: number
}

export const useWorkBooksByCompany = ({
	page = 1,
	companyId,
	limit = 10,
	search = "",
	sortBy = WORK_BOOK_SORT_BY.CREATED_AT,
	sortOrder = "desc",
	enabled = true,
}: {
	page?: number
	limit?: number
	search?: string
	companyId: string
	sortBy?: WorkBookSortBy
	sortOrder?: WorkBookSortOrder
	enabled?: boolean
}) => {
	return useQuery<WorkBooksResponse>({
		queryKey: ["workBooks", { page, limit, search, companyId, sortBy, sortOrder }],
		enabled,
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)
			if (sortBy) searchParams.set("sortBy", sortBy)
			if (sortOrder) searchParams.set("sortOrder", sortOrder)

			const res = await fetch(`/api/work-book/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching work books")

			const raw = await res.json()
			return {
				...raw,
				workBooks: raw.workBooks.map((wb: WorkBookByCompany) => ({
					...wb,
					solicitationDate: new Date(wb.solicitationDate),
					programDate: new Date(wb.programDate),
					estimatedEndDate: wb.estimatedEndDate ? new Date(wb.estimatedEndDate) : null,
					rescheduledEndDate: wb.rescheduledEndDate ? new Date(wb.rescheduledEndDate) : null,
				})),
			} satisfies WorkBooksResponse
		},
	})
}
