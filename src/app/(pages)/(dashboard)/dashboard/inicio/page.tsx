import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { CompanyDashboardContent } from "@/components/dashboard/company-dashboard-content"

export default async function DashboardHomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.companyId) {
		return notFound()
	}

	const companyId = session.user.companyId

	return <CompanyDashboardContent companyId={companyId} />
}
