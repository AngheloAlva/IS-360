import { useActivityLogFiltersStore } from "@/project/activity-log/stores/activity-log-filters-store"
import { useActivityLogs } from "@/project/activity-log/hooks/use-activity-logs"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useActivityLogFilters = () => {
	const store = useActivityLogFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const logsQuery = useActivityLogs({
		pageSize: store.pageSize,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		module: store.module,
		action: store.action,
		userId: store.userId,
		actorType: store.actorType,
		severity: store.severity,
		dateRange: store.dateRange,
	})

	return {
		filters: {
			search: store.search,
			module: store.module,
			action: store.action,
			userId: store.userId,
			actorType: store.actorType,
			severity: store.severity,
			dateRange: store.dateRange,
			page: store.page,
			pageSize: store.pageSize,
			orderBy: store.orderBy,
			order: store.order,
		},

		actions: {
			setSearch: store.setSearch,
			setModule: store.setModule,
			setAction: store.setAction,
			setUserId: store.setUserId,
			setActorType: store.setActorType,
			setSeverity: store.setSeverity,
			setDateRange: store.setDateRange,
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		logs: logsQuery,
	}
}
