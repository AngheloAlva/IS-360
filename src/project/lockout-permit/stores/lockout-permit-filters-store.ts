import { persist } from "zustand/middleware"
import { create } from "zustand"
import type { DateRange } from "react-day-picker"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface LockoutPermitFiltersState {
	page: number
	order: Order
	search: string
	orderBy: OrderBy
	companyId: string | null
	approvedBy: string | null
	typeFilter: string | null
	dateRange: DateRange | null
	statusFilter: string | null

	setOrder: (order: Order) => void
	setPage: (page: number) => void
	setSearch: (search: string) => void
	setOrderBy: (orderBy: OrderBy) => void
	setTypeFilter: (type: string | null) => void
	setDateRange: (range: DateRange | null) => void
	setStatusFilter: (status: string | null) => void
	setCompanyId: (companyId: string | null) => void
	setApprovedBy: (approvedBy: string | null) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	page: 1,
	search: "",
	dateRange: null,
	companyId: null,
	approvedBy: null,
	typeFilter: null,
	statusFilter: null,
	order: "desc" as Order,
	orderBy: "createdAt" as OrderBy,
}

export const useLockoutPermitFiltersStore = create<LockoutPermitFiltersState>()(
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
			name: "lockout-permit-filters",
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
