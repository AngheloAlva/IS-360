import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateLocation } from "@/project/location/actions/updateLocation"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

export type RenameLocationVariables = {
	id: string
	name: string
}

export function useRenameLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (variables: RenameLocationVariables) =>
			updateLocation({ id: variables.id, name: variables.name }),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["locations"] })

			const previousLocations = queryClient.getQueryData<WorkLocation[]>(["locations"])

			if (previousLocations) {
				const target = previousLocations.find((l) => l.id === variables.id)
				if (target) {
					const oldName = target.name
					const updated = previousLocations.map((l) => {
						if (!l.path.startsWith(target.path)) return l
						const newPath = target.path.replace(oldName, variables.name)
						return { ...l, path: l.path.replace(target.path, newPath) }
					})
					queryClient.setQueryData<WorkLocation[]>(["locations"], updated)
				}
			}

			return { previousLocations }
		},
		onError: (_err, _vars, context) => {
			if (context?.previousLocations) {
				queryClient.setQueryData(["locations"], context.previousLocations)
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
			void queryClient.invalidateQueries({ queryKey: ["equipments"] })
		},
	})
}
