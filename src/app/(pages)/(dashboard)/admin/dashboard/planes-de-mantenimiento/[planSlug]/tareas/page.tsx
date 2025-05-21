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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return <div>No tienes acceso a esta página</div>

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex items-start justify-between gap-4 md:flex-row">
				<div className="flex items-start gap-2">
					<BackButton href="/admin/dashboard/planes-de-mantenimiento" className="mt-1 min-w-fit" />

					<div className="flex flex-col gap-1">
						<h1 className="text-text w-fit text-3xl font-bold capitalize">
							{planSlug.replaceAll("-", " ")}
						</h1>
						<p className="text-text w-fit text-sm sm:text-base">
							En esta sección puedes gestionar las tareas de mantenimiento del plan de
							mantenimiento: {planSlug.replaceAll("-", " ")}.
						</p>
					</div>
				</div>

				<MaintenancePlanTaskForm maintenancePlanSlug={planSlug} userId={session.user.id} />
			</div>

			<MaintenancePlanTaskDataTable planSlug={planSlug} />
		</div>
	)
}
