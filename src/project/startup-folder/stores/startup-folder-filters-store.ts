import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import type { WORK_ORDER_STATUS } from "@prisma/client"

interface StartupFolderFiltersState {
	search: string
	withOtActive: boolean
	otStatus: WORK_ORDER_STATUS | undefined
	orderBy: OrderBy
	order: Order

	setSearch: (search: string) => void
	setWithOtActive: (withOtActive: boolean) => void
	setOtStatus: (otStatus: WORK_ORDER_STATUS | undefined) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
}

const initialState = {
	search: "",
	otStatus: undefined,
	withOtActive: false,
	order: "asc" as Order,
	orderBy: "name" as OrderBy,
}

export const useStartupFolderFiltersStore = create<StartupFolderFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setSearch: (search) => {
				set((state) => ({ ...state, search }))
			},

			setWithOtActive: (withOtActive) => {
				set({ withOtActive })
			},

			setOtStatus: (otStatus) => {
				set({ otStatus })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy })
			},

			setOrder: (order) => {
				set({ order })
			},

			resetFilters: () => {
				set({
					search: "",
					withOtActive: false,
					otStatus: undefined,
					orderBy: "name" as OrderBy,
					order: "asc" as Order,
				})
			},
		}),
		{
			name: "startup-folder-filters",
			partialize: (state) => ({
				search: state.search,
				withOtActive: state.withOtActive,
				otStatus: state.otStatus,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)
