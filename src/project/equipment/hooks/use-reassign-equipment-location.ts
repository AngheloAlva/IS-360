import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { reassignEquipmentLocation } from "@/project/location/actions/reassignEquipmentLocation"
import type { ReassignEquipmentLocationInput } from "@/project/location/schemas/location.schema"
import type { EquipmentsResponse, WorkEquipment } from "@/project/equipment/hooks/use-equipments"

export function useReassignEquipmentLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: ReassignEquipmentLocationInput) => reassignEquipmentLocation(input),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["equipments"] })

			const snapshot = queryClient.getQueriesData<EquipmentsResponse>({
				queryKey: ["equipments"],
			})

			for (const [queryKey, data] of snapshot) {
				if (!data?.equipments) continue
				const updated = data.equipments.map((e) => {
					if (e.id !== variables.equipmentId) return e
					return { ...e, locationId: variables.locationId } as WorkEquipment
				})
				queryClient.setQueryData(queryKey, { ...data, equipments: updated })
			}

			return { previousQueries: snapshot }
		},
		onError: (_err, _vars, context) => {
			if (context?.previousQueries) {
				for (const [queryKey, data] of context.previousQueries) {
					queryClient.setQueryData(queryKey, data)
				}
			}
			toast.error("Error al reasignar la ubicación del equipo")
		},
		onSuccess: () => {
			toast.success("Ubicación del equipo actualizada")
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["equipments"] })
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
		},
	})
}
