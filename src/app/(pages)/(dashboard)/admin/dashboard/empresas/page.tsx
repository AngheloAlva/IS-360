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
			<div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Empresas Contratistas</h1>
						<p className="opacity-90">Gestión y seguimiento de empresas contratistas registradas</p>
					</div>

					{hasPermission.success && <CreateCompanyFormSheet />}
				</div>
			</div>

			<CompanyStatsCards />

			<CompanyDataTable />
		</div>
	)
}
