import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Metadata } from "next"

import { auth } from "@/lib/auth"

import WorkPermitStatsContainer from "@/project/work-permit/components/stats/WorkPermitStatsContainer"
import WorkPermitsTable from "@/project/work-permit/components/data/WorkPermitsTable"

export const metadata: Metadata = {
	title: "Permisos de Trabajo | OTC",
	description: "Gestión y monitoreo de permisos de trabajo para empresas contratistas",
}

export default async function WorkPermitsAdminPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return notFound()

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workPermit: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 overflow-hidden transition-all">
			<div className="rounded-lg bg-gradient-to-r from-pink-600 to-rose-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Permisos de Trabajo</h1>
						<p className="opacity-90">
							Gestión y monitoreo de permisos de trabajo para empresas contratistas
						</p>
					</div>
				</div>
			</div>

			<WorkPermitStatsContainer />

			<WorkPermitsTable hasPermission={hasPermission.success} userId={session.user.id} />
		</div>
	)
}
