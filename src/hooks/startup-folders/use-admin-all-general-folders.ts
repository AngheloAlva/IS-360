"use client"

import { useQuery } from "@tanstack/react-query"
import { StartupFolderWithDocuments } from "./use-startup-folder"

const getAllGeneralFolders = async (): Promise<StartupFolderWithDocuments[]> => {
	const response = await fetch("/api/admin/startup-folders/general")

	if (!response.ok) {
		throw new Error("Error al obtener las carpetas de arranque generales")
	}

	return response.json()
}

export function useAdminAllGeneralFolders() {
	return useQuery({
		queryKey: ["admin", "allGeneralStartupFolders"],
		queryFn: getAllGeneralFolders,
	})
}
