import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface CompanyFiltersState {
	search: string
	page: number
	pageSize: number
	orderBy: OrderBy
	order: Order
	activeStatus: "all" | "active" | "inactive"

	setSearch: (search: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void
	setActiveStatus: (activeStatus: "all" | "active" | "inactive") => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	page: 1,
	pageSize: 15,
	search: "",
	order: "desc" as Order,
	orderBy: "createdAt" as OrderBy,
	activeStatus: "active" as const,
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

			setPageSize: (pageSize) => {
				set({ pageSize, page: 1 })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy, page: 1 })
			},

			setOrder: (order) => {
				set({ order, page: 1 })
			},

			setActiveStatus: (activeStatus) => {
				set({ activeStatus, page: 1 })
			},

			resetFilters: () => {
				set({
					search: "",
					page: 1,
					pageSize: 15,
					orderBy: "createdAt",
					order: "desc",
					activeStatus: "active",
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
				pageSize: state.pageSize,
				orderBy: state.orderBy,
				order: state.order,
				activeStatus: state.activeStatus,
			}),
		}
	)
)
