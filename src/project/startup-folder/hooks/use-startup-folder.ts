import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import type {
	Company,
	BasicFolder,
	WorkerFolder,
	VehicleFolder,
	BasicDocument,
	WorkerDocument,
	VehicleDocument,
	StartupFolderType,
	WORK_ORDER_STATUS,
	EnvironmentalFolder,
	EnvironmentalDocument,
	SafetyAndHealthFolder,
	SafetyAndHealthDocument,
	StartupFolder as StartupFolderModel,
	StartupFolderStatus,
} from "@prisma/client"

export interface StartupFolder extends StartupFolderModel {
	company: {
		name: string
		rut: string
		image?: string
		id: string
	}
	type: StartupFolderType
	reviewComments?: string | null
	submittedBy?: {
		name: string
	} | null
	basicFolder: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
	safetyAndHealthFolders: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
	environmentalFolders: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
	workersFolders: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
	vehiclesFolders: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
	basicFolders: {
		totalDocuments: number
		approvedDocuments: number
		rejectedDocuments: number
		submittedDocuments: number
		draftDocuments: number
		isCompleted: boolean
	}[]
}

interface UseStartupFolderParams {
	companyId?: string
	folderId?: string
}

export const fetchStartupFolder: QueryFunction<
	StartupFolder[],
	readonly ["startupFolder", { companyId?: string; folderId?: string }]
> = async ({ queryKey }) => {
	const [, { companyId, folderId }] = queryKey

	const searchParams = new URLSearchParams()
	if (companyId) {
		searchParams.set("companyId", companyId)
	} else if (folderId) {
		searchParams.set("folderId", folderId)
	}

	const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folder")

	return res.json()
}

export const useStartupFolder = ({ companyId, folderId }: UseStartupFolderParams) => {
	const queryKey = ["startupFolder", { companyId, folderId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFolder,
		enabled: !!companyId || !!folderId,
	})
}

interface CompanyWithStartupFolders extends Company {
	StartupFolders: {
		id: string
		name: string
		createdAt: Date
		type: StartupFolderType
		status: StartupFolderStatus
		workersFolders: WorkerFolder[] & { documents: WorkerDocument[] }
		vehiclesFolders: VehicleFolder[] & { documents: VehicleDocument[] }
		safetyAndHealthFolders: SafetyAndHealthFolder[] & { documents: SafetyAndHealthDocument[] }
		environmentalFolders: EnvironmentalFolder[] & { documents: EnvironmentalDocument[] }
		basicFolders: BasicFolder[] & { documents: BasicDocument[] }
	}[]
}

interface UseStartupFoldersListParams {
	search?: string
	withOtActive?: boolean
	otStatus?: WORK_ORDER_STATUS
	order?: Order
	orderBy?: OrderBy
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
		},
	]
> = async ({ queryKey }) => {
	const [, { search, withOtActive, otStatus, order, orderBy }] = queryKey

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (withOtActive !== undefined) searchParams.set("withOtActive", withOtActive.toString())
	if (otStatus) searchParams.set("otStatus", otStatus)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)

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
}: UseStartupFoldersListParams) => {
	const queryKey = ["startupFolders", { search, withOtActive, otStatus, order, orderBy }] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFoldersList,
	})
}
