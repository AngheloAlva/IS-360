import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface MaintenancePlanFiltersState {
	search: string
	page: number
	orderBy: OrderBy
	order: Order

	setSearch: (search: string) => void
	setPage: (page: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	search: "",
	page: 1,
	orderBy: "name" as OrderBy,
	order: "asc" as Order,
}

export const useMaintenancePlanFiltersStore = create<MaintenancePlanFiltersState>()(
	persist(
		(set) => ({
			...initialState,

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
					search: "",
					page: 1,
					orderBy: "name",
					order: "asc",
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "maintenance-plan-filters",
			partialize: (state) => ({
				search: state.search,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)