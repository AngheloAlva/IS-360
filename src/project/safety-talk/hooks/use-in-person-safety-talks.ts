"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import type { OrphanedSafetyTalkRecord } from "../columns/orphaned-safety-talk-columns"

interface InPersonSafetyTalksResponse {
	metadata: {
		generatedAt: string
		totalRecords: number
		filteredRecords: number
		currentPage: number
		totalPages: number
		limit: number
		hasNextPage: boolean
		hasPreviousPage: boolean
		description: string
	}
	records: OrphanedSafetyTalkRecord[]
}

interface UseInPersonSafetyTalksParams {
	page?: number
	limit?: number
	search?: string
}

const fetchInPersonSafetyTalks = async ({
	page = 1,
	limit = 15,
	search = "",
}: UseInPersonSafetyTalksParams): Promise<InPersonSafetyTalksResponse> => {
	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/orphaned-records?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error al obtener los registros presenciales")

	return res.json()
}

export const useInPersonSafetyTalks = ({
	page = 1,
	limit = 15,
	search = "",
}: UseInPersonSafetyTalksParams = {}) => {
	return useQuery({
		queryKey: ["in-person-safety-talks", { page, limit, search }],
		queryFn: () => fetchInPersonSafetyTalks({ page, limit, search }),
	})
}

export const useCreateInPersonSafetyTalk = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: Record<string, unknown>) => {
			const res = await fetch("/api/orphaned-records", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || "Error al crear el registro")
			}

			return res.json()
		},
		onSuccess: () => {
   void queryClient.invalidateQueries({ queryKey: ["in-person-safety-talks"] })
		},
	})
}

export const useDeleteInPersonSafetyTalk = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/orphaned-records/${id}`, {
				method: "DELETE",
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || "Error al eliminar el registro")
			}

			return res.json()
		},
		onSuccess: () => {
   void queryClient.invalidateQueries({ queryKey: ["in-person-safety-talks"] })
		},
	})
}
