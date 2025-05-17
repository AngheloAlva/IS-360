import { useQuery } from "@tanstack/react-query"

import type {
	User,
	ReviewStatus,
	StartupFolder,
	WorkerDocument,
	CompanyDocument,
	VehicleDocument,
	EnvironmentalDocument,
	Vehicle,
} from "@prisma/client"

export interface WorkerFolderWithDocuments {
	id: string
	status: ReviewStatus
	submittedAt: Date | null
	workerId: string
	worker: User
	documents: WorkerDocument[]
	startupFolderId: string
	createdAt: Date
	updatedAt: Date
}

export interface VehicleFolderWithDocuments {
	id: string
	status: ReviewStatus
	submittedAt: Date | null
	vehicleId: string
	vehicle: Vehicle
	documents: VehicleDocument[]
	startupFolderId: string
	createdAt: Date
	updatedAt: Date
}

export interface StartupFolderWithDocuments extends Omit<StartupFolder, "workerFolders"> {
	company: {
		name: string
		rut: string
	}
	reviewComments?: string | null
	submittedBy?: {
		name: string
	} | null
	environmentalsDocuments: EnvironmentalDocument[]
	companyDocuments: CompanyDocument[]
	workersFolders: WorkerFolderWithDocuments[]
	vehiclesFolders: VehicleFolderWithDocuments[]
}

interface UseStartupFolderParams {
	companyId: string
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

export const useCompanyStartupFolders = () => {
	return useQuery<StartupFolderWithDocuments[]>({
		queryKey: ["startupFolders"],
		queryFn: async () => {
			const res = await fetch(`/api/startup-folders/list`)
			if (!res.ok) throw new Error("Error fetching general startup folders")

			return res.json()
		},
	})
}
