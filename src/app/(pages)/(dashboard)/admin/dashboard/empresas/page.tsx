import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import CreateCompanyFormSheet from "@/components/forms/admin/company/CreateCompanyFormSheet"
import { CompanyDataTable } from "@/components/sections/admin/companies/CompanyDataTable"
import CompanyStatsCards from "@/components/sections/admin/companies/CompanyStatsCards"

export default async function AdminCompaniesPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				company: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-center justify-between">
				<h1 className="w-fit text-3xl font-bold">Lista de Empresas</h1>

				{hasPermission.success && <CreateCompanyFormSheet />}
			</div>

			<CompanyStatsCards />

			<CompanyDataTable />
		</div>
	)
}
