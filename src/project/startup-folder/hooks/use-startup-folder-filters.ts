import { useMemo } from "react"

import { useStartupFolderFiltersStore } from "@/project/startup-folder/stores/startup-folder-filters-store"
import { useStartupFoldersList } from "@/project/startup-folder/hooks/use-startup-folder"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useStartupFolderFilters = () => {
	const store = useStartupFolderFiltersStore()

	const debouncedSearch = useDebounce(store.search, 400)

	const queryParams = useMemo(
		() => ({
			order: store.order,
			orderBy: store.orderBy,
			search: debouncedSearch,
			otStatus: store.otStatus,
			withOtActive: store.withOtActive,
			onlyWithReviewRequest: store.onlyWithReviewRequest,
			showArchived: store.showArchived,
			onlyWithArchivedFolders: store.onlyWithArchivedFolders,
		}),
		[
			store.order,
			store.orderBy,
			debouncedSearch,
			store.otStatus,
			store.withOtActive,
			store.onlyWithReviewRequest,
			store.showArchived,
			store.onlyWithArchivedFolders,
		]
	)

	const { data, isLoading, isFetching } = useStartupFoldersList(queryParams)

	const actions = useMemo(
		() => ({
			setSearch: store.setSearch,
			setWithOtActive: store.setWithOtActive,
			setOtStatus: store.setOtStatus,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			setonlyWithReviewRequest: store.setOnlyWithReviewRequest,
			setShowArchived: store.setShowArchived,
			setOnlyWithArchivedFolders: store.setOnlyWithArchivedFolders,
		}),
		[
			store.setSearch,
			store.setWithOtActive,
			store.setOtStatus,
			store.setOrderBy,
			store.setOrder,
			store.resetFilters,
			store.setOnlyWithReviewRequest,
			store.setShowArchived,
			store.setOnlyWithArchivedFolders,
		]
	)

	const filters = useMemo(
		() => ({
			search: store.search,
			withOtActive: store.withOtActive,
			otStatus: store.otStatus,
			orderBy: store.orderBy,
			order: store.order,
			onlyWithReviewRequest: store.onlyWithReviewRequest,
			showArchived: store.showArchived,
			onlyWithArchivedFolders: store.onlyWithArchivedFolders,
		}),
		[
			store.search,
			store.withOtActive,
			store.otStatus,
			store.orderBy,
			store.order,
			store.onlyWithReviewRequest,
			store.showArchived,
			store.onlyWithArchivedFolders,
		]
	)

	return {
		filters,
		actions,
		isLoading,
		isFetching,
		startupFolders: data,
	}
}
