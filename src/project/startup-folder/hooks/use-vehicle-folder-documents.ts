import { type QueryFunction, useQuery } from "@tanstack/react-query"

import { getVehicleFolderDocuments } from "../actions/vehicle/get-vehicle-folder-documents"

interface UseVehicleFolderDocumentsParams {
	vehicleId: string
	startupFolderId: string
}

export const fetchVehicleFolderDocuments: QueryFunction<
	Awaited<ReturnType<typeof getVehicleFolderDocuments>>,
	readonly ["vehicleFolderDocuments", UseVehicleFolderDocumentsParams]
> = async ({ queryKey }) => {
	const [, { startupFolderId, vehicleId }] = queryKey

	return getVehicleFolderDocuments({ startupFolderId, vehicleId })
}

export const useVehicleFolderDocuments = ({
	vehicleId,
	startupFolderId,
}: UseVehicleFolderDocumentsParams) => {
	const queryKey = ["vehicleFolderDocuments", { startupFolderId, vehicleId }] as const

	return useQuery({
		queryKey,
		queryFn: fetchVehicleFolderDocuments,
		enabled: !!startupFolderId && !!vehicleId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		placeholderData: (previousData) => previousData,
	})
}
