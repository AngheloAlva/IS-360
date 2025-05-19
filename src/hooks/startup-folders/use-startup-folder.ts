import { useQuery } from "@tanstack/react-query"

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

export const useStartupFolder = ({ companyId, folderId }: UseStartupFolderParams) => {
	return useQuery<StartupFolderWithDocuments>({
		queryKey: ["startupFolder", companyId || folderId],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			if (companyId) searchParams.set("companyId", companyId)
			if (folderId) searchParams.set("folderId", folderId)

			const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching general startup folder")

			return res.json()
		},
	})
}

interface UseStartupFoldersListParams {
	search?: string
}

export const useStartupFoldersList = ({ search }: UseStartupFoldersListParams) => {
	return useQuery<StartupFolderWithDocuments[]>({
		queryKey: ["startupFolders", search],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/startup-folders/list?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching general startup folders")

			return res.json()
		},
	})
}
