import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import MaintenancePlanStatsContainer from "@/project/maintenance-plan/components/stats/MaintenancePlanStatsContainer"
import { MaintenancePlanTable } from "@/project/maintenance-plan/components/data/MaintenancePlanTable"
import MaintenancePlanForm from "@/project/maintenance-plan/components/forms/MaintenancePlanForm"
import ScrollToTableButton from "@/shared/components/ScrollToTable"

export default async function MaintenancePlansPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return null

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				maintenancePlan: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Planes de Mantenimiento</h1>
						<p className="opacity-90">
							Gestión y seguimiento de planes de mantenimiento preventivo
						</p>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-2">
						<ScrollToTableButton
							label="Lista Planes"
							id="maintenance-plans-list"
							className="text-purple-600 hover:bg-white hover:text-purple-600"
						/>

						{hasPermission.success && <MaintenancePlanForm userId={session.user.id} />}
					</div>
				</div>
			</div>

			<MaintenancePlanStatsContainer />

			<MaintenancePlanTable userId={session.user.id} id="maintenance-plans-list" />
		</div>
	)
}
