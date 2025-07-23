import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import CompanyStatsContainer from "@/project/company/components/stats/CompanyStatsContainer"
import { CompanyTable } from "@/project/company/components/data/CompanyTable"
import CompanyForm from "@/project/company/components/forms/CompanyForm"
import ScrollToTableButton from "@/shared/components/ScrollToTable"
import VideoTutorials from "@/shared/components/VideoTutorials"

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
		<div className="flex h-full w-full flex-1 flex-col gap-8">
			<div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
				<div className="flex items-center justify-between gap-2">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Empresas Contratistas</h1>
						<p className="opacity-90">Gestión y seguimiento de empresas contratistas registradas</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<VideoTutorials
							videos={[
								{
									title: "Creacion de Empresas",
									description: "Tutorial de como crear una empresa.",
									url: "https://youtube.com/embed/zA0xehVOB0s",
								},
							]}
						/>

						<ScrollToTableButton
							label="Lista Empresas"
							id="company-table"
							className="text-indigo-600 hover:bg-white hover:text-indigo-600"
						/>

						{hasPermission.success && <CompanyForm />}
					</div>
				</div>
			</div>

			<CompanyStatsContainer />

			<CompanyTable />
		</div>
	)
}
