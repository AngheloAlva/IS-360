import { useStartupFolderFiltersStore } from "@/project/startup-folder/stores/startup-folder-filters-store"
import { useStartupFoldersList } from "@/project/startup-folder/hooks/use-startup-folder"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useStartupFolderFilters = () => {
	const store = useStartupFolderFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const { data, isLoading } = useStartupFoldersList({
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		otStatus: store.otStatus,
		withOtActive: store.withOtActive,
		onlyWithReviewRequest: store.onlyWithReviewRequest,
	})

	return {
		filters: {
			search: store.search,
			withOtActive: store.withOtActive,
			otStatus: store.otStatus,
			orderBy: store.orderBy,
			order: store.order,
			onlyWithReviewRequest: store.onlyWithReviewRequest,
		},

		actions: {
			setSearch: store.setSearch,
			setWithOtActive: store.setWithOtActive,
			setOtStatus: store.setOtStatus,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			setonlyWithReviewRequest: store.setOnlyWithReviewRequest,
		},

		// Query
		startupFolders: data,
		isLoading,
	}
}
