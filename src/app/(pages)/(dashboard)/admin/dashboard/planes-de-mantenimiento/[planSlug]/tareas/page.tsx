import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import MaintenancePlanMonthlyStatsContainer from "@/project/maintenance-plan/components/stats/MaintenancePlanMonthlyStatsContainer"
import { MaintenancePlanTaskTable } from "@/project/maintenance-plan/components/data/MaintenancePlanTaskTable"
import MaintenancePlanTaskForm from "@/project/maintenance-plan/components/forms/MaintenancePlanTaskForm"
import BackButton from "@/shared/components/BackButton"

interface MaintenancePlanPageProps {
	params: Promise<{ planSlug: string }>
}

export default async function MaintenancePlansPage({
	params,
}: MaintenancePlanPageProps): Promise<React.ReactElement> {
	const { planSlug } = await params

	const maintenancePlanSlug = planSlug.split("_")[0]

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return <div>No tienes acceso a esta página</div>

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				maintenancePlan: ["create"],
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-4 transition-all">
			<div className="rounded-lg bg-linear-to-r from-indigo-600 to-purple-700 p-6 shadow-lg dark:from-indigo-800 dark:to-purple-900">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 text-white">
						<BackButton
							href="/admin/dashboard/planes-de-mantenimiento"
							className="bg-white/10 text-white hover:bg-white/10"
						/>

						<div>
							<h1 className="text-3xl font-bold tracking-tight capitalize">
								{maintenancePlanSlug.replaceAll("-", " ")}
							</h1>
							<p className="opacity-90">
								Gestión y seguimiento de tareas de mantenimiento preventivo
							</p>
						</div>
					</div>

					{hasPermission.success && (
						<MaintenancePlanTaskForm
							userId={session.user.id}
							maintenancePlanSlug={maintenancePlanSlug}
						/>
					)}
				</div>
			</div>

			<MaintenancePlanMonthlyStatsContainer planSlug={maintenancePlanSlug} />

			<MaintenancePlanTaskTable
				userId={session.user.id}
				planSlug={maintenancePlanSlug}
				hasPermission={hasPermission.success}
			/>
		</div>
	)
}
