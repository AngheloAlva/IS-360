import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { StartupFolderType, WORK_ORDER_STATUS, StartupFolderStatus } from "@prisma/client"
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
	company: {
		id: string
		rut: string
		name: string
		image?: string
	}
	basicFolder: ProcessedFolder[]
	safetyAndHealthFolders: ProcessedFolder[]
	environmentalFolders: ProcessedFolder[]
	environmentFolders: ProcessedFolder[]
	techSpecsFolders: ProcessedFolder[]
	workersFolders: ProcessedWorkerFolder[]
	vehiclesFolders: ProcessedFolder[]
}

interface UseStartupFolderParams {
	companyId?: string
}

export const fetchStartupFolder: QueryFunction<
	StartupFolder[],
	readonly ["startupFolder", { companyId?: string }]
> = async ({ queryKey }) => {
	const [, { companyId }] = queryKey

	const searchParams = new URLSearchParams()
	if (companyId) {
		searchParams.set("companyId", companyId)
	}

	const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folder")

	return res.json()
}

export const useStartupFolder = ({ companyId }: UseStartupFolderParams) => {
	const queryKey = ["startupFolder", { companyId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFolder,
		enabled: !!companyId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})
}

interface ListFolder {
	id: string
	status: string
	totalDocuments: number
	approvedDocuments: number
	rejectedDocuments: number
	submittedDocuments: number
	draftDocuments: number
	isCompleted: boolean
	[key: string]: unknown
}

interface ListWorkerFolder extends ListFolder {
	isDriver: boolean
	worker?: {
		id: string
		name: string
		email: string
		rut: string
	}
}

interface CompanyWithStartupFolders {
	id: string
	name: string
	rut: string
	image?: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
	StartupFolders: {
		id: string
		name: string
		createdAt: Date
		type: StartupFolderType
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
		},
	]
> = async ({ queryKey }) => {
	const [, { search, withOtActive, otStatus, order, orderBy, onlyWithReviewRequest }] = queryKey

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (withOtActive !== undefined) searchParams.set("withOtActive", withOtActive.toString())
	if (otStatus) searchParams.set("otStatus", otStatus)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (onlyWithReviewRequest)
		searchParams.set("onlyWithReviewRequest", onlyWithReviewRequest.toString())

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
}: UseStartupFoldersListParams) => {
	const queryKey = [
		"startupFolders",
		{ search, withOtActive, otStatus, order, orderBy, onlyWithReviewRequest },
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
