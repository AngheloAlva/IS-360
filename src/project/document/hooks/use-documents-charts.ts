import { useQuery } from "@tanstack/react-query"

export interface AreaDaum {
	name: string
	value: number
	fill: string
}

export interface ExpirationDaum {
	id: string
	name: string
	value: number
}

export interface ResponsibleDaum {
	name: string
	value: number
}

export interface RecentChange {
	id: string
	fileName: string
	previousName: string
	modifiedBy: string
	modifiedAt: string
	reason: string
	userRole: string
	userArea?: string
}

export interface ActivityByDay {
	date: string
	archivos: number
	carpetas: number
}

export interface ChangesPerDay {
	date: string
	cambios: number
}

export interface FileType {
	name: string
	value: number
}

export interface MonthlyUpload {
	month: string
	count: number
}

export interface TopContributor {
	name: string
	value: number
}

export interface Metrics {
	totalFolders: number
}

interface DocumentsChartsResponse {
	areaData: AreaDaum[]
	expirationData: ExpirationDaum[]
	responsibleData: ResponsibleDaum[]
	recentChanges: RecentChange[]
	activityByDay: ActivityByDay[]
	changesPerDay: ChangesPerDay[]
	metrics: Metrics
	fileTypes: FileType[]
	monthlyUploads: MonthlyUpload[]
	topContributors: TopContributor[]
}

export const useDocumentsCharts = () => {
	return useQuery<DocumentsChartsResponse>({
		queryKey: ["documents"],
		queryFn: async () => {
			const res = await fetch(`/api/documents/charts`)
			if (!res.ok) throw new Error("Error fetching documents")

			return res.json()
		},
		staleTime: 0,
		gcTime: 1000 * 60 * 5,
	})
}
