import { useQuery } from "@tanstack/react-query"

export interface VehicleDetail {
	id: string
	plate: string
	model: string
	year: number
	brand: string
	type: string
	color?: string | null
	isMain: boolean
	createdAt: string
	updatedAt: string
	vehiclesFolders: Array<{
		id: string
		status: string
		createdAt: string
		updatedAt: string
		startupFolder: {
			id: string
			name: string
			status: string
		}
	}>
}

interface UseVehicleByIdParams {
	vehicleId: string
}

export const fetchVehicleById = async ({
	vehicleId,
}: UseVehicleByIdParams): Promise<VehicleDetail> => {
	const response = await fetch(`/api/vehicles/${vehicleId}`)
	
	if (!response.ok) {
		throw new Error("Error al obtener el vehículo")
	}
	
	return response.json()
}

export const useVehicleById = ({ vehicleId }: UseVehicleByIdParams) => {
	return useQuery({
		queryKey: ["vehicle", { vehicleId }],
		queryFn: () => fetchVehicleById({ vehicleId }),
		enabled: !!vehicleId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	})
}
