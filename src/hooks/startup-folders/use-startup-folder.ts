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
	StartupFolderWithDocuments,
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
	const queryKey = [
		"startupFolder",
		{ companyId: `company-${companyId}`, folderId: folderId },
	] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFolder,
		enabled: !!companyId || !!folderId,
	})
}

interface UseStartupFoldersListParams {
	search?: string
}

export const fetchStartupFoldersList: QueryFunction<
	StartupFolderWithDocuments[],
	readonly ["startupFolders", string | undefined]
> = async ({ queryKey }) => {
	const [, search] = queryKey

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/startup-folders/list?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folders")

	return res.json()
}

export const useStartupFoldersList = ({ search }: UseStartupFoldersListParams) => {
	const queryKey = ["startupFolders", search] as const

	return useQuery({
		queryKey,
		queryFn: fetchStartupFoldersList,
	})
}
