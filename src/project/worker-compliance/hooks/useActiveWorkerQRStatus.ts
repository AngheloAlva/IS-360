"use client"

import { useQuery } from "@tanstack/react-query"

import { checkActiveWorkerQR } from "@/project/worker-compliance/actions/check-active-worker-qr"

export function useActiveWorkerQRStatus(workerId: string, enabled: boolean) {
	return useQuery({
		queryKey: ["worker-qr-status", workerId],
		queryFn: () => checkActiveWorkerQR(workerId),
		enabled,
		staleTime: 0,
	})
}
