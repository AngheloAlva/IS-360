import { QueryFunction, useQuery } from "@tanstack/react-query"

import type { WorkOrder } from "@prisma/client"

export interface WorkBookById extends WorkOrder {
	equipment: {
		name: string
	}[]
	workEntries: {
		include: {
			createdBy: true
			assignedUsers: true
		}
	}
	company: {
		id: string
		rut: string
		name: string
		image?: string
	}
	supervisor: {
		id: string
		rut: string
		name: string
		email: string
		phone: string
	}
	responsible: {
		id: string
		rut: string
		name: string
		email: string
		phone: string
	}
	_count: {
		milestones: number
	}
}

export const fetchWorkBookById: QueryFunction<
	WorkBookByIdResponse,
	readonly ["workBooks", { workOrderId: string }]
> = async ({ queryKey }) => {
	const [, { workOrderId }] = queryKey

	const res = await fetch(`/api/work-book/${workOrderId}`)
	if (!res.ok) throw new Error("Error fetching work book")

	return res.json()
}

interface WorkBookByIdResponse {
	workBook: WorkBookById
}

export const useWorkBookById = ({ workOrderId }: { workOrderId: string }) => {
	return useQuery<WorkBookByIdResponse>({
		queryKey: ["workBooks", { workOrderId }],
		queryFn: (fn) => fetchWorkBookById({ ...fn, queryKey: ["workBooks", { workOrderId }] }),
	})
}
