import { useQuery } from "@tanstack/react-query"

import type { WorkPermitLockoutPermit } from "./use-work-permit"

interface LockoutPermitsResponse {
	lockoutPermits: WorkPermitLockoutPermit[]
}

export function useWorkPermitLockoutPermits(workPermitId: string, enabled = true) {
	return useQuery<LockoutPermitsResponse>({
		queryKey: ["workPermitLockoutPermits", workPermitId],
		queryFn: async () => {
			const response = await fetch(`/api/work-permit/${workPermitId}/lockout-permits`)

			if (!response.ok) {
				throw new Error("Error fetching lockout permits")
			}

			return response.json()
		},
		enabled,
	})
}
