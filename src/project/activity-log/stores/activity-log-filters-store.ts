import { persist } from "zustand/middleware"
import { DateRange } from "react-day-picker"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface ActivityLogFiltersState {
	search: string
	module: string
	action: string
	userId: string
	actorType: string
	severity: string
	dateRange: DateRange | null
	page: number
	pageSize: number
	orderBy: OrderBy
	order: Order

	setSearch: (search: string) => void
	setModule: (module: string) => void
	setAction: (action: string) => void
	setUserId: (userId: string) => void
	setActorType: (actorType: string) => void
	setSeverity: (severity: string) => void
	setDateRange: (range: DateRange | null) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	search: "",
	module: "all",
	action: "all",
	userId: "all",
	actorType: "all",
	severity: "all",
	dateRange: null as DateRange | null,
	page: 1,
	pageSize: 25,
	orderBy: "createdAt" as OrderBy,
	order: "desc" as Order,
}

export const useActivityLogFiltersStore = create<ActivityLogFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setModule: (module) => {
				set({ module, page: 1 })
			},

			setAction: (action) => {
				set({ action, page: 1 })
			},

			setUserId: (userId) => {
				set({ userId, page: 1 })
			},

			setActorType: (actorType) => {
				set({ actorType, page: 1 })
			},

			setSeverity: (severity) => {
				set({ severity, page: 1 })
			},

			setDateRange: (dateRange) => {
				set({ dateRange, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setPageSize: (pageSize) => {
				set({ pageSize, page: 1 })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy, page: 1 })
			},

			setOrder: (order) => {
				set({ order, page: 1 })
			},

			resetFilters: () => {
				set({ ...initialState })
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "activity-log-filters",
			partialize: (state) => ({
				search: state.search,
				module: state.module,
				action: state.action,
				userId: state.userId,
				actorType: state.actorType,
				severity: state.severity,
				pageSize: state.pageSize,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)
