"use client"

import { useQuery } from "@tanstack/react-query"

interface SafetyTalkForContractor {
	id: string
	title: string
	description: string | null
	slug: string
	isPresential: boolean
	minimumScore: number
	expiresAt: Date
	// Si el usuario ha completado la charla
	userSafetyTalk?: {
		id: string
		score: number
		passed: boolean
		completedAt: Date
		expiresAt: Date
	} | null
}

interface GetContractorSafetyTalksResponse {
	availableTalks: SafetyTalkForContractor[]
	completedTalks: SafetyTalkForContractor[]
}

interface UseContractorSafetyTalksParams {
	onlyAvailable?: boolean
	onlyCompleted?: boolean
}

async function getContractorSafetyTalks({
	onlyAvailable = false,
	onlyCompleted = false,
}: UseContractorSafetyTalksParams = {}): Promise<GetContractorSafetyTalksResponse> {
	const params = new URLSearchParams()

	if (onlyAvailable) {
		params.append("onlyAvailable", "true")
	}

	if (onlyCompleted) {
		params.append("onlyCompleted", "true")
	}

	const response = await fetch(`/api/safety-talks/contractor?${params.toString()}`)

	if (!response.ok) {
		throw new Error("Error al obtener las charlas de seguridad")
	}

	return response.json()
}

export function useContractorSafetyTalks(params: UseContractorSafetyTalksParams = {}) {
	return useQuery({
		queryKey: ["contractor-safety-talks", params],
		queryFn: () => getContractorSafetyTalks(params),
	})
}
