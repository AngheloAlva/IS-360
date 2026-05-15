"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { generateWorkerQRToken } from "@/project/worker-compliance/actions/generate-worker-qr-token"

export type GenerateWorkerQRResult = {
	token: string
	url: string
}

export function useGenerateWorkerQR(workerId: string) {
	return useMutation<GenerateWorkerQRResult, Error, { force?: boolean } | void>({
		mutationFn: (variables) =>
			generateWorkerQRToken(workerId, { force: variables?.force }),
		onError: (error) => {
			toast.error(error.message ?? "Error al generar el QR")
		},
	})
}
