import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteLocation } from "@/project/location/actions/deleteLocation"
import type { DeleteLocationInput } from "@/project/location/schemas/location.schema"

export function useDeleteLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: DeleteLocationInput) => deleteLocation(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
		},
	})
}
