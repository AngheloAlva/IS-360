import { useQuery } from "@tanstack/react-query"

export interface SafetyTalk {
	id: string
	slug: string
	title: string
	description: string | null
	isPresential: boolean
	expiresAt: Date
	timeLimit: number | null
	minimumScore: number
	createdAt: Date
	_count: {
		questions: number
		resources: number
		userSafetyTalks: number
	}
}

interface UseSafetyTalksParams {
	page?: number
	limit?: number
	search?: string
}

interface SafetyTalksResponse {
	safetyTalks: SafetyTalk[]
	total: number
	pages: number
}

export const useSafetyTalks = ({
	page = 1,
	limit = 10,
	search = "",
}: UseSafetyTalksParams = {}) => {
	return useQuery<SafetyTalksResponse>({
		queryKey: ["safety-talks", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/safety-talks?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching safety talks")

			return res.json()
		},
	})
}
