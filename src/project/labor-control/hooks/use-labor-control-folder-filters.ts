import { useMemo } from "react"

import { useLaborControlFolderFiltersStore } from "../stores/labor-control-folder-filters-store"
import { useCompaniesWithLaborControlFolder } from "./use-companies-with-labor-control-folder"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useLaborControlFolderFilters = () => {
	const store = useLaborControlFolderFiltersStore()

	const debouncedSearch = useDebounce(store.search, 400)

	const queryParams = useMemo(
		() => ({
			page: store.page,
			order: store.order,
			limit: store.limit,
			orderBy: store.orderBy,
			search: debouncedSearch,
			onlyWithReviewRequest: store.onlyWithReviewRequest,
		}),
		[
			store.page,
			store.order,
			store.limit,
			store.orderBy,
			debouncedSearch,
			store.onlyWithReviewRequest,
		]
	)

	const { data, isLoading, isFetching, refetch, isRefetching } =
		useCompaniesWithLaborControlFolder(queryParams)

	const actions = useMemo(
		() => ({
			setPage: store.setPage,
			setLimit: store.setLimit,
			setOrder: store.setOrder,
			setSearch: store.setSearch,
			setOrderBy: store.setOrderBy,
			resetFilters: store.resetFilters,
			setonlyWithReviewRequest: store.setOnlyWithReviewRequest,
		}),
		[
			store.setPage,
			store.setLimit,
			store.setOrder,
			store.setSearch,
			store.setOrderBy,
			store.resetFilters,
			store.setOnlyWithReviewRequest,
		]
	)

	const filters = useMemo(
		() => ({
			page: store.page,
			limit: store.limit,
			order: store.order,
			search: store.search,
			orderBy: store.orderBy,
			onlyWithReviewRequest: store.onlyWithReviewRequest,
		}),
		[store.page, store.limit, store.order, store.search, store.orderBy, store.onlyWithReviewRequest]
	)

	return {
		filters,
		actions,
		refetch,
		isLoading,
		isFetching,
		isRefetching,
		pages: data?.pages,
		total: data?.total,
		companies: data?.companiesWithLaborControlFolders,
	}
}
