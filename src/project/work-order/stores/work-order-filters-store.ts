import { DateRange } from "react-day-picker"
import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { WorkOrderSortBy, WorkOrderSortOrder } from "@/project/work-order/hooks/use-work-order"

interface WorkOrderFiltersState {
	statusFilter: string | null
	priorityFilter: string | null
	typeFilter: string | null
	companyId: string | null
	responsibleId: string | null
	dateRange: DateRange | null
	search: string
	page: number
	pageSize: number
	sortBy: WorkOrderSortBy
	sortOrder: WorkOrderSortOrder
	onlyWithRequestClousure: boolean

	setStatusFilter: (status: string | null) => void
	setPriorityFilter: (priority: string | null) => void
	setTypeFilter: (type: string | null) => void
	setCompanyId: (companyId: string | null) => void
	setResponsibleId: (responsibleId: string | null) => void
	setDateRange: (range: DateRange | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setSortBy: (sortBy: WorkOrderSortBy) => void
	setSortOrder: (sortOrder: WorkOrderSortOrder) => void
	setOnlyWithRequestClousure: (onlyWithRequestClousure: boolean) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	statusFilter: null,
	priorityFilter: null,
	typeFilter: null,
	companyId: null,
	responsibleId: null,
	dateRange: null,
	search: "",
	page: 1,
	pageSize: 15,
	sortBy: "createdAt" as WorkOrderSortBy,
	sortOrder: "desc" as WorkOrderSortOrder,
	onlyWithRequestClousure: false,
}

export const useWorkOrderFiltersStore = create<WorkOrderFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setStatusFilter: (status) => {
				set({ statusFilter: status, page: 1 })
			},

			setPriorityFilter: (priority) => {
				set({ priorityFilter: priority, page: 1 })
			},

			setTypeFilter: (type) => {
				set({ typeFilter: type, page: 1 })
			},

			setCompanyId: (companyId) => {
				set({ companyId, page: 1 })
			},

			setResponsibleId: (responsibleId) => {
				set({ responsibleId, page: 1 })
			},

			setDateRange: (range) => {
				set({ dateRange: range, page: 1 })
			},

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setPageSize: (pageSize) => {
				set({ pageSize, page: 1 })
			},

			setSortBy: (sortBy) => {
				set({ sortBy, page: 1 })
			},

			setSortOrder: (sortOrder) => {
				set({ sortOrder, page: 1 })
			},

			setOnlyWithRequestClousure: (onlyWithRequestClousure) => {
				set({ onlyWithRequestClousure, page: 1 })
			},

			resetFilters: () => {
				set({
					page: 1,
					search: "",
					companyId: null,
					responsibleId: null,
					dateRange: null,
					typeFilter: null,
					statusFilter: null,
					priorityFilter: null,
					pageSize: initialState.pageSize,
					sortBy: initialState.sortBy,
					sortOrder: initialState.sortOrder,
					onlyWithRequestClousure: false,
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "work-order-filters",
			partialize: (state) => ({
				statusFilter: state.statusFilter,
				priorityFilter: state.priorityFilter,
				typeFilter: state.typeFilter,
				companyId: state.companyId,
				responsibleId: state.responsibleId,
				dateRange: state.dateRange,
				search: state.search,
				pageSize: state.pageSize,
				sortBy: state.sortBy,
				sortOrder: state.sortOrder,
			}),
		}
	)
)
