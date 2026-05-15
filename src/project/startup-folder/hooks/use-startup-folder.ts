import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type {
	StartupFolderType,
	WORK_ORDER_STATUS,
	StartupFolderStatus,
} from "@/generated/prisma/enums"
import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface DocumentCounts {
	total: number
	approved: number
	rejected: number
	submitted: number
	expired: number
	draft: number
}

interface ProcessedFolder {
	id: string
	status: StartupFolderStatus
	documentCounts: DocumentCounts
	isCompleted: boolean
	_count: {
		documents: number
	}
	[key: string]: unknown
}

interface ProcessedWorkerFolder extends ProcessedFolder {
	isDriver: boolean
}

export interface StartupFolder {
	id: string
	name: string
	status: StartupFolderStatus
	createdAt: Date
	updatedAt: Date
	type: StartupFolderType
	moreMonthDuration: boolean
	isArchived: boolean
	company: {
		id: string
		rut: string
		name: string
		image?: string
	}
	basicFolder: Array<ProcessedFolder & { worker: { name: string } }>
	safetyAndHealthFolders: ProcessedFolder[]
	environmentalFolders: ProcessedFolder[]
	environmentFolders: ProcessedFolder[]
	techSpecsFolders: ProcessedFolder[]
	workersFolders: Array<ProcessedWorkerFolder & { worker: { name: string } }>
	vehiclesFolders: Array<ProcessedFolder & { vehicle: { plate: string } }>
}

interface UseStartupFolderParams {
	companyId?: string
	showArchived?: boolean
	archivedOnly?: boolean
}

export const fetchStartupFolder: QueryFunction<
	StartupFolder[],
	readonly ["startupFolder", { companyId?: string; showArchived?: boolean; archivedOnly?: boolean }]
> = async ({ queryKey }) => {
	const [, { companyId, showArchived, archivedOnly }] = queryKey

	const searchParams = new URLSearchParams()
	if (companyId) {
		searchParams.set("companyId", companyId)
	}
	if (showArchived) {
		searchParams.set("showArchived", "true")
	}
	if (archivedOnly) {
		searchParams.set("archivedOnly", "true")
	}

	const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folder")

	return res.json()
}

export const useStartupFolder = ({
	companyId,
	showArchived = false,
	archivedOnly = false,
}: UseStartupFolderParams) => {
	const queryKey = ["startupFolder", { companyId, showArchived, archivedOnly }] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFolder,
		enabled: !!companyId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		placeholderData: (previousData) => previousData,
	})
}

export interface ListFolder {
	id: string
	status: string
	totalDocuments: number
	approvedDocuments: number
	rejectedDocuments: number
	submittedDocuments: number
	expiredDocuments: number
	draftDocuments: number
	isCompleted: boolean
	[key: string]: unknown
}

export interface ListWorkerFolder extends ListFolder {
	isDriver: boolean
	worker?: {
		id: string
		name: string
		email: string
		rut: string
	}
}

export interface CompanyWithStartupFolders {
	id: string
	name: string
	rut: string
	image?: string
	createdAt: Date
	updatedAt: Date
	isActive: boolean
	StartupFolders: {
		id: string
		name: string
		createdAt: Date
		isDeleted: boolean
		isArchived: boolean
		type: StartupFolderType
		moreMonthDuration: boolean
		status: StartupFolderStatus
		workersFolders: ListWorkerFolder[]
		vehiclesFolders: ListFolder[]
		safetyAndHealthFolders: ListFolder[]
		environmentalFolders: ListFolder[]
		environmentFolders: ListFolder[]
		basicFolders: ListFolder[]
		techSpecsFolders: ListFolder[]
	}[]
}

interface UseStartupFoldersListParams {
	search?: string
	withOtActive?: boolean
	otStatus?: WORK_ORDER_STATUS
	order?: Order
	orderBy?: OrderBy
	onlyWithReviewRequest?: boolean
	showArchived?: boolean
}

export const fetchStartupFoldersList: QueryFunction<
	CompanyWithStartupFolders[],
	readonly [
		"startupFolders",
		{
			search?: string
			withOtActive?: boolean
			otStatus?: WORK_ORDER_STATUS
			order?: Order
			orderBy?: OrderBy
			onlyWithReviewRequest?: boolean
			showArchived?: boolean
		},
	]
> = async ({ queryKey }) => {
	const [
		,
		{ search, withOtActive, otStatus, order, orderBy, onlyWithReviewRequest, showArchived },
	] = queryKey

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (withOtActive !== undefined) searchParams.set("withOtActive", withOtActive.toString())
	if (otStatus) searchParams.set("otStatus", otStatus)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (onlyWithReviewRequest)
		searchParams.set("onlyWithReviewRequest", onlyWithReviewRequest.toString())
	if (showArchived !== undefined) searchParams.set("showArchived", showArchived.toString())

	const res = await fetch(`/api/startup-folders/list?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folders")

	return res.json()
}

export const useStartupFoldersList = ({
	order,
	search,
	orderBy,
	otStatus,
	withOtActive,
	onlyWithReviewRequest = false,
	showArchived = false,
}: UseStartupFoldersListParams) => {
	const queryKey = [
		"startupFolders",
		{ search, withOtActive, otStatus, order, orderBy, onlyWithReviewRequest, showArchived },
	] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFoldersList,

		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		placeholderData: (previousData) => previousData,
	})
}

// Hook to get count of archived folders for a specific company
interface UseArchivedFoldersCountParams {
	companyId?: string
}

export const useArchivedFoldersCount = ({ companyId }: UseArchivedFoldersCountParams) => {
	return useQuery({
		queryKey: ["archivedFoldersCount", { companyId }] as const,
		queryFn: async () => {
			if (!companyId) return 0

			const searchParams = new URLSearchParams()
			searchParams.set("companyId", companyId)
			searchParams.set("showArchived", "true")
			searchParams.set("archivedOnly", "true")

			const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
			if (!res.ok) return 0

			const data = await res.json()
			return Array.isArray(data) ? data.length : 0
		},
		enabled: !!companyId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	})
}
