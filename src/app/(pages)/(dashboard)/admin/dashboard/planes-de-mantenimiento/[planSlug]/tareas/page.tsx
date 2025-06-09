import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import { MaintenancePlanTaskDataTable } from "@/components/sections/admin/maintenance-plans/MaintenancePlanTaskDataTable"
import MaintenancePlanTaskForm from "@/components/forms/maintenance-plan/MaintenancePlanTaskForm"
import BackButton from "@/components/shared/BackButton"

interface MaintenancePlanPageProps {
	params: Promise<{ planSlug: string }>
}

export default async function MaintenancePlansPage({
	params,
}: MaintenancePlanPageProps): Promise<React.ReactElement> {
	const { planSlug } = await params

	const maintenancePlanSlug = planSlug.split("_")[0]
	const equipmentId = planSlug.split("_")[1]

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
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
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
							equipmentId={equipmentId}
							maintenancePlanSlug={maintenancePlanSlug}
						/>
					)}
				</div>
			</div>

			<MaintenancePlanTaskDataTable planSlug={maintenancePlanSlug} />
		</div>
	)
}
