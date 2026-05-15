import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { reassignEquipmentToLocation } from "@/project/equipment/actions/reassignEquipmentToLocation"

export interface ReassignEquipmentToLocationVariables {
	id: string
	locationId: string
	clearParent: boolean
}

export function useReassignEquipmentToLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (variables: ReassignEquipmentToLocationVariables) =>
			reassignEquipmentToLocation(variables),
		onError: () => {
			toast.error("Error al reasignar el equipo a la ubicación")
		},
		onSuccess: (result) => {
			if (!result.ok) {
				toast.error(result.message ?? "Error al reasignar el equipo")
				return
			}
			toast.success("Equipo reasignado exitosamente")
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["equipments"] })
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
		},
	})
}
