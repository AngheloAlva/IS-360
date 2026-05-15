import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import MaintenanceKpiContainer from "@/project/maintenance-plan/components/stats/MaintenanceKpiContainer"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function IndicadoresPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return null

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6 transition-all">
			<ModuleHeader
				title="Indicadores de Mantenimiento"
				description="KPIs de gestión de mantenimiento, órdenes de trabajo y solicitudes"
				className="bg-linear-to-r from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"
			/>

			<MaintenanceKpiContainer />
		</div>
	)
}
