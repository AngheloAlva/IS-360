import { QueryFunction, useQuery } from "@tanstack/react-query"

export interface Company {
	id: string
	rut: string
	name: string
	image: string | null
}

interface UseCompanyByIdParams {
	companyId: string
}

interface CompanyByIdResponse {
	company: Company
}

export const useCompanyById = ({ companyId }: UseCompanyByIdParams) => {
	return useQuery<CompanyByIdResponse>({
		queryKey: ["company", { companyId }],
		queryFn: (fn) => fetchCompanyById({ ...fn, queryKey: ["company", { companyId }] }),
	})
}

export const fetchCompanyById: QueryFunction<
	CompanyByIdResponse,
	["company", { companyId: string }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { companyId }]: [string, { companyId: string }] = queryKey

	const res = await fetch(`/api/companies/${companyId}`)
	if (!res.ok) throw new Error("Error fetching company")

	return res.json()
}
