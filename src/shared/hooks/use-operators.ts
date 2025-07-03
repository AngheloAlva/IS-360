import { type QueryFunction, useQuery } from "@tanstack/react-query"

export interface Operator {
	id: string
	rut: string
	name: string
}

interface OperatorsParams {
	page: number
	limit: number
}

interface OperatorsResponse {
	operators: Operator[]
	total: number
	pages: number
}

export const fetchOperators: QueryFunction<
	OperatorsResponse,
	readonly [
		"operators",
		{
			page: number
			limit: number
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())

	const res = await fetch(`/api/operators?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching operators")

	return res.json()
}

export const useOperators = ({ page = 1, limit = 10 }: OperatorsParams) => {
	const queryKey = ["operators", { page, limit }] as const

	return useQuery<OperatorsResponse>({
		queryKey,
		queryFn: (fn) => fetchOperators({ ...fn, queryKey }),
	})
}
