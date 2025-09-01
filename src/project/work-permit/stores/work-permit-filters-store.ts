import { persist } from "zustand/middleware"
import { create } from "zustand"
import type { DateRange } from "react-day-picker"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface WorkPermitFiltersState {
	statusFilter: string | null
	companyId: string | null
	approvedBy: string | null
	typeFilter: string | null
	dateRange: DateRange | null
	search: string
	page: number
	orderBy: OrderBy
	order: Order

	setStatusFilter: (status: string | null) => void
	setCompanyId: (companyId: string | null) => void
	setApprovedBy: (approvedBy: string | null) => void
	setTypeFilter: (type: string | null) => void
	setDateRange: (range: DateRange | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	statusFilter: null,
	companyId: null,
	approvedBy: null,
	typeFilter: null,
	dateRange: null,
	search: "",
	page: 1,
	orderBy: "createdAt" as OrderBy,
	order: "desc" as Order,
}

export const useWorkPermitFiltersStore = create<WorkPermitFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setStatusFilter: (statusFilter) => {
				set({ statusFilter, page: 1 })
			},

			setCompanyId: (companyId) => {
				set({ companyId, page: 1 })
			},

			setApprovedBy: (approvedBy) => {
				set({ approvedBy, page: 1 })
			},

			setTypeFilter: (typeFilter) => {
				set({ typeFilter, page: 1 })
			},

			setDateRange: (dateRange) => {
				set({ dateRange, page: 1 })
			},

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy, page: 1 })
			},

			setOrder: (order) => {
				set({ order, page: 1 })
			},

			resetFilters: () => {
				set({
					statusFilter: null,
					companyId: null,
					approvedBy: null,
					typeFilter: null,
					dateRange: null,
					search: "",
					page: 1,
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "work-permit-filters",
			partialize: (state) => ({
				statusFilter: state.statusFilter,
				companyId: state.companyId,
				approvedBy: state.approvedBy,
				typeFilter: state.typeFilter,
				dateRange: state.dateRange,
				search: state.search,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)
