import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface CompanyFiltersState {
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
	orderBy: "createdAt" as OrderBy,
	order: "desc" as Order,
}

export const useCompanyFiltersStore = create<CompanyFiltersState>()(
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
					orderBy: "createdAt",
					order: "desc",
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "company-filters",
			partialize: (state) => ({
				search: state.search,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)