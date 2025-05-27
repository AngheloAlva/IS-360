import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { MaintenancePlanDataTable } from "@/components/sections/admin/maintenance-plans/MaintenancePlanDataTable"
import MaintenancePlanForm from "@/components/forms/maintenance-plan/MaintenancePlanForm"

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
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex flex-col gap-1">
					<h1 className="text-text w-fit text-3xl font-bold">Planes de Mantenimiento</h1>
					<p className="text-text w-fit text-sm sm:text-base">
						En este modulo puedes gestionar los planes de mantenimiento de la plataforma.
					</p>
				</div>

				{hasPermission.success && <MaintenancePlanForm userId={session.user.id} />}
			</div>

			<MaintenancePlanDataTable />
		</div>
	)
}
