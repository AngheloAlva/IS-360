import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { updateLocation } from "@/project/location/actions/updateLocation"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

export type MoveLocationVariables = {
	id: string
	parentId: string | null
}

function recomputeDescendantPaths(
	locations: WorkLocation[],
	movedId: string,
	newParentId: string | null
): WorkLocation[] {
	const byId = new Map(locations.map((l) => [l.id, l]))
	const moved = byId.get(movedId)
	if (!moved) return locations

	const newParentPath = newParentId ? (byId.get(newParentId)?.path ?? "") : null
	const newMovedPath = newParentPath ? `${newParentPath} / ${moved.name}` : moved.name

	const oldPrefix = moved.path

	return locations.map((l) => {
		if (l.id === movedId) {
			return { ...l, parentId: newParentId, path: newMovedPath }
		}
		if (l.path.startsWith(`${oldPrefix} / `)) {
			return { ...l, path: l.path.replace(oldPrefix, newMovedPath) }
		}
		return l
	})
}

export function useMoveLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (variables: MoveLocationVariables) =>
			updateLocation({ id: variables.id, parentId: variables.parentId }),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["locations"] })

			const previousLocations = queryClient.getQueryData<WorkLocation[]>(["locations"])

			if (previousLocations) {
				const optimistic = recomputeDescendantPaths(previousLocations, variables.id, variables.parentId)
				queryClient.setQueryData<WorkLocation[]>(["locations"], optimistic)
			}

			return { previousLocations }
		},
		onError: (_err, _vars, context) => {
			if (context?.previousLocations) {
				queryClient.setQueryData(["locations"], context.previousLocations)
			}

			const err = _err as Error & { status?: number }
			if (err.status === 409) {
				toast.error("No se puede mover: generaría un ciclo en la jerarquía")
			} else {
				toast.error("Error al mover la ubicación")
			}
		},
		onSuccess: () => {
			toast.success("Ubicación movida exitosamente")
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
			void queryClient.invalidateQueries({ queryKey: ["equipments"] })
		},
	})
}
