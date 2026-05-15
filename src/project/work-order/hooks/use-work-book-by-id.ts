import { QueryFunction, useQuery } from "@tanstack/react-query"

import type { WorkOrder } from "@/generated/prisma/client"

export interface WorkBookById extends WorkOrder {
	equipments: {
		id: string
		tag: string
		name: string
		type: string
		location: { id: string; name: string; path: string }
		attachments: {
			id: string
			url: string
			name: string
		}[]
	}[]
	workBookEntries: {
		include: {
			createdBy: true
			assignedUsers: true
		}
	}
	company?: {
		id: string
		rut: string
		name: string
		image?: string
		isActive: boolean
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
	workPermits: {
		participants: {
			id: string
			rut: string
			name: string
		}[]
	}[]
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

export const useWorkBookById = ({
	workOrderId,
	enabled = true,
}: {
	workOrderId: string
	enabled?: boolean
}) => {
	return useQuery<WorkBookByIdResponse>({
		queryKey: ["workBooks", { workOrderId }],
		queryFn: (fn) => fetchWorkBookById({ ...fn, queryKey: ["workBooks", { workOrderId }] }),
		refetchOnWindowFocus: false,
		enabled,
	})
}
