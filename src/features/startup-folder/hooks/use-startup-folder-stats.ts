import { useQuery } from "@tanstack/react-query"

import type { ReviewStatus } from "@prisma/client"

interface DocumentStatusCount {
	status: ReviewStatus
	label: string
	count: number
}

interface FolderDocuments {
	name: string
	data: DocumentStatusCount[]
}

export interface StartupFolderStats {
	// Estadísticas básicas
	totalFolders: number
	totalFoldersActive: number
	totalFoldersToReview: number
	totalCompaniesApproved: number
	// Datos para gráficas
	charts: {
		documentsByStatus: DocumentStatusCount[]
		documentsByFolder: FolderDocuments[]
	}
}

export function useStartupFolderStats() {
	return useQuery<StartupFolderStats>({
		queryKey: ["startup-folders", "stats"],
		queryFn: async () => {
			const response = await fetch("/api/startup-folders/stats")

			if (!response.ok) {
				throw new Error("Error al obtener las estadísticas de carpetas de arranque")
			}

			return response.json()
		},
	})
}
