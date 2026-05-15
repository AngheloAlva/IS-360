"use client"

import { useCompanyStats } from "@/project/home/hooks/use-company-stats"

import { CompanyOverviewCards } from "./company-overview-cards"

interface CompanyDashboardContentProps {
	companyId: string
}

export function CompanyDashboardContent({ companyId }: CompanyDashboardContentProps) {
	const { data, isLoading } = useCompanyStats(companyId)

	return (
		<>
			<CompanyOverviewCards data={data} isLoading={isLoading} />

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
		</>
	)
}
