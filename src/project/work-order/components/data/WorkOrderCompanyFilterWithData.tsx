"use client"

import { useCompanies } from "@/project/company/hooks/use-companies"

import { WorkOrderCompanyFilter } from "./WorkOrderFilters"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface WorkOrderCompanyFilterWithDataProps {
	value: string | null
	onChange: (value: string | null) => void
}

export function CompanyFilterLoadingSkeleton() {
	return <Skeleton className="h-9 w-full" />
}

export default function WorkOrderCompanyFilterWithData({
	value,
	onChange,
}: WorkOrderCompanyFilterWithDataProps) {
	const { data: companies, isLoading } = useCompanies({
		limit: 1000,
		orderBy: "name",
	})

	if (isLoading) {
		return <CompanyFilterLoadingSkeleton />
	}

	return (
		<WorkOrderCompanyFilter value={value} onChange={onChange} companies={companies?.companies} />
	)
}
