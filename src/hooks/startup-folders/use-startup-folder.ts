import { QueryFunction, useQuery } from "@tanstack/react-query"

import type {
	Vehicle,
	WorkerFolder,
	VehicleFolder,
	StartupFolder,
	WorkerDocument,
	VehicleDocument,
	EnvironmentalFolder,
	SafetyAndHealthFolder,
	EnvironmentalDocument,
	SafetyAndHealthDocument,
	Company,
	WORK_ORDER_STATUS,
} from "@prisma/client"

export interface StartupFolderWithDocuments extends StartupFolder {
	company: {
		name: string
		rut: string
		image?: string
		id: string
	}
	reviewComments?: string | null
	submittedBy?: {
		name: string
	} | null
	environmentalsDocuments: EnvironmentalDocument[]
	workersFolders: Array<
		WorkerFolder & {
			documents: WorkerDocument[]
			worker: {
				id: string
				name: string
				email: string
			}
		}
	>
	vehiclesFolders: Array<VehicleFolder & { documents: VehicleDocument[]; vehicle: Vehicle }>
	safetyAndHealthFolders: Array<SafetyAndHealthFolder & { documents: SafetyAndHealthDocument[] }>
	environmentalFolders: Array<EnvironmentalFolder & { documents: EnvironmentalDocument[] }>
}

interface UseStartupFolderParams {
	companyId?: string
	folderId?: string
}

export const fetchStartupFolder: QueryFunction<
	StartupFolderWithDocuments[],
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
	StartupFolders: Omit<StartupFolderWithDocuments, "company">[]
}

interface UseStartupFoldersListParams {
	search?: string
	withOtActive?: boolean
	otStatus?: WORK_ORDER_STATUS
}

export const fetchStartupFoldersList: QueryFunction<
	CompanyWithStartupFolders[],
	readonly [
		"startupFolders",
		{ search?: string; withOtActive?: boolean; otStatus?: WORK_ORDER_STATUS },
	]
> = async ({ queryKey }) => {
	const [, { search, withOtActive, otStatus }] = queryKey

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (withOtActive !== undefined) searchParams.set("withOtActive", withOtActive.toString())
	if (otStatus) searchParams.set("otStatus", otStatus)

	const res = await fetch(`/api/startup-folders/list?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folders")

	return res.json()
}

export const useStartupFoldersList = ({
	search,
	withOtActive,
	otStatus,
}: UseStartupFoldersListParams) => {
	const queryKey = ["startupFolders", { search, withOtActive, otStatus }] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFoldersList,
	})
}
