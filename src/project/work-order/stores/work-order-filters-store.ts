import { DateRange } from "react-day-picker"
import { persist } from "zustand/middleware"
import { create } from "zustand"

interface WorkOrderFiltersState {
	statusFilter: string | null
	priorityFilter: string | null
	typeFilter: string | null
	companyId: string | null
	dateRange: DateRange | null
	search: string
	page: number
	orderBy: "createdAt" | "name"
	order: "asc" | "desc"
	onlyWithRequestClousure: boolean

	setStatusFilter: (status: string | null) => void
	setPriorityFilter: (priority: string | null) => void
	setTypeFilter: (type: string | null) => void
	setCompanyId: (companyId: string | null) => void
	setDateRange: (range: DateRange | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setOrderBy: (orderBy: "createdAt" | "name") => void
	setOrder: (order: "asc" | "desc") => void
	setOnlyWithRequestClousure: (onlyWithRequestClousure: boolean) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	statusFilter: null,
	priorityFilter: null,
	typeFilter: null,
	companyId: null,
	dateRange: null,
	search: "",
	page: 1,
	orderBy: "createdAt" as const,
	order: "desc" as const,
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

			setDateRange: (range) => {
				set({ dateRange: range, page: 1 })
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

			setOnlyWithRequestClousure: (onlyWithRequestClousure) => {
				set({ onlyWithRequestClousure, page: 1 })
			},

			resetFilters: () => {
				set({
					statusFilter: null,
					priorityFilter: null,
					typeFilter: null,
					companyId: null,
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
			name: "work-order-filters",
			partialize: (state) => ({
				statusFilter: state.statusFilter,
				priorityFilter: state.priorityFilter,
				typeFilter: state.typeFilter,
				companyId: state.companyId,
				dateRange: state.dateRange,
				search: state.search,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)
