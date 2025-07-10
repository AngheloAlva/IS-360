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
	})
}
