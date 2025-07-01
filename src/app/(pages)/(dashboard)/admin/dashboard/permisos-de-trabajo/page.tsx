import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Metadata } from "next"

import { auth } from "@/lib/auth"

import ScrollToTableButton from "@/shared/components/ScrollToTable"
import WorkPermitStatsContainer from "@/project/work-permit/components/stats/WorkPermitStatsContainer"
import WorkPermitsTable from "@/project/work-permit/components/data/WorkPermitsTable"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { PlusCircleIcon } from "lucide-react"

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
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-pink-600 to-rose-700 p-6">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Permisos de Trabajo</h1>
						<p className="opacity-90">
							Gestión y monitoreo de permisos de trabajo para empresas contratistas
						</p>
					</div>

					<div className="flex items-center gap-2">
						<ScrollToTableButton
							id="work-permit-table"
							label="Lista Permisos"
							className="text-rose-600 hover:bg-white hover:text-rose-600"
						/>

						{hasPermission.success && (
							<Link href="/admin/dashboard/permisos-de-trabajo/agregar">
								<Button
									size={"lg"}
									className="cursor-pointer gap-1.5 bg-white font-semibold tracking-wide text-pink-600 transition-all hover:scale-105 hover:bg-white hover:text-pink-700"
								>
									<PlusCircleIcon className="ml-1" />
									Permiso de Trabajo
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>

			<WorkPermitStatsContainer />

			<WorkPermitsTable
				id="work-permit-table"
				userId={session.user.id}
				hasPermission={hasPermission.success}
			/>
		</div>
	)
}
