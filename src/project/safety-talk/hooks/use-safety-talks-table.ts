import { useQuery } from "@tanstack/react-query"
import type { ApiSafetyTalk } from "../types/api-safety-talk"

interface UseSafetyTalksTableParams {
	page?: number
	limit?: number
	search?: string
}

interface SafetyTalksTableResponse {
	data: ApiSafetyTalk[]
	total: number
	pages: number
}

export function useSafetyTalksTable({
	page = 1,
	limit = 10,
	search = "",
}: UseSafetyTalksTableParams = {}) {
	return useQuery<SafetyTalksTableResponse>({
		queryKey: ["safety-talks-table", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/safety-talks/table?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error al obtener las charlas de seguridad")

			return res.json()
		},
	})
}
