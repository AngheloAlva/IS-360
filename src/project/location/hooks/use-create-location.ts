import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createLocation } from "@/project/location/actions/createLocation"
import type { CreateLocationInput } from "@/project/location/schemas/location.schema"

export function useCreateLocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: CreateLocationInput) => createLocation(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["locations"] })
		},
	})
}
