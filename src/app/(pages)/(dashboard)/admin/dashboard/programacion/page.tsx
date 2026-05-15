import { headers } from "next/headers"

import { auth } from "@/lib/auth"

import GanttContainer from "@/project/maintenance-plan/components/gantt/GanttContainer"
import ModuleHeader from "@/shared/components/ModuleHeader"

export default async function ProgramacionPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) return null

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6 transition-all">
			<ModuleHeader
				title="Programación"
				description="Gantt de mantenimiento con proyección de actividades y fechas futuras"
				className="bg-linear-to-r from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"
			/>

			<GanttContainer />
		</div>
	)
}
