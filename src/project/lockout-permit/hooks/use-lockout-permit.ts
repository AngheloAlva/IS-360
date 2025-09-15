"use client"

import { useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import { LockoutPermit } from "@prisma/client"

export interface LockoutPermitParams {
	page?: number
	limit?: number
	search?: string
	statusFilter?: string | null
	companyId?: string | null
	typeFilter?: string | null
	orderBy?: OrderBy
	order?: Order
	approvedBy?: string | null
	dateRange?: DateRange | null
}

export interface LockoutPermitResponse {
	lockoutPermits: Array<
		LockoutPermit & {
			supervisor?: { id: string; name: string; rut: string } | null
			operator?: { id: string; name: string; rut: string } | null
			removeLockout?: { id: string; name: string; rut: string } | null
			areaResponsible: { id: string; name: string; rut: string }
			requestedBy: { id: string; name: string; rut: string }
			company: { id: string; name: string; rut: string }
			otNumberRef?: {
				id: string
				otNumber: string
				workRequest?: string | null
				workDescription?: string | null
			} | null
			equipments: { id: string; name: string; tagNumber?: string | null }[]
			_count: {
				lockoutRegistrations: number
				zeroEnergyReviews: number
				attachments: number
			}
		}
	>
	total: number
	pages: number
}

const buildUrlParams = (params: LockoutPermitParams) => {
	const searchParams = new URLSearchParams()

	if (params.page) searchParams.append("page", params.page.toString())
	if (params.limit) searchParams.append("limit", params.limit.toString())
	if (params.search) searchParams.append("search", params.search)
	if (params.statusFilter) searchParams.append("statusFilter", params.statusFilter)
	if (params.companyId) searchParams.append("companyId", params.companyId)
	if (params.typeFilter) searchParams.append("typeFilter", params.typeFilter)
	if (params.orderBy) searchParams.append("orderBy", params.orderBy)
	if (params.order) searchParams.append("order", params.order)
	if (params.approvedBy) searchParams.append("approvedBy", params.approvedBy)
	if (params.dateRange?.from) {
		searchParams.append("dateFrom", encodeURIComponent(params.dateRange.from.toISOString()))
	}
	if (params.dateRange?.to) {
		searchParams.append("dateTo", encodeURIComponent(params.dateRange.to.toISOString()))
	}

	return searchParams.toString()
}

async function fetchLockoutPermits(params: LockoutPermitParams): Promise<LockoutPermitResponse> {
	const urlParams = buildUrlParams(params)
	const response = await fetch(`/api/lockout-permit?${urlParams}`)

	if (!response.ok) {
		throw new Error("Network response was not ok")
	}

	return response.json()
}

export function useLockoutPermits(params: LockoutPermitParams) {
	return useQuery({
		queryKey: ["lockout-permits", JSON.stringify(params)],
		queryFn: () => fetchLockoutPermits(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
